"""Records a scripted tour of the library as an MP4.

Usage: python -m http.server 8791 (in the repo root), then python tools/record.py [out.mp4]
Needs playwright and ffmpeg. Frames come from Chrome's screencast, so animations stay smooth.
"""
import base64, shutil, subprocess, sys, tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = 'http://127.0.0.1:8791/index.html'
OUT = Path(sys.argv[1] if len(sys.argv) > 1 else 'tour.mp4').resolve()
W, H = 1920, 1080

# A pixel arrow that follows the mouse, since screen recordings of headless Chrome show no cursor.
CURSOR = """
addEventListener('DOMContentLoaded', () => {
  const c = document.createElement('div');
  c.style.cssText = 'position:fixed;left:0;top:0;width:22px;height:30px;z-index:99999;pointer-events:none;image-rendering:pixelated;' +
    "background:url(\\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 11 15' shape-rendering='crispEdges'%3E%3Cpath d='M0 0h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h-4v1h1v2h1v2h-2v-1h-1v-2h-1v-1h-1v1h-1v1h-1z' fill='%23141833'/%3E%3Cpath d='M1 2h1v1h1v1h1v1h1v1h1v1h1v1h1v1h-3v1h1v2h1v1h-1v-1h-1v-2h-1v-1h-1v1h-1z' fill='%23fff'/%3E%3C/svg%3E\\") no-repeat;background-size:100% 100%;";
  document.body.append(c);
  addEventListener('mousemove', (e) => { c.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`; }, true);
});
"""

frames = []


def main():
    tmp = Path(tempfile.mkdtemp())
    with sync_playwright() as pw:
        args = ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
        try:
            b = pw.chromium.launch(channel='chrome', args=args)
        except Exception:
            b = pw.chromium.launch(args=args)
        p = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=1)
        p.add_init_script(CURSOR)
        p.goto(URL)
        p.wait_for_function("!document.getElementById('box-name').textContent.startsWith('Dusting')")
        p.mouse.move(W / 2, H * 0.62)
        p.wait_for_timeout(1500)

        cdp = p.context.new_cdp_session(p)

        def on_frame(e):
            frames.append((e['metadata']['timestamp'], e['data']))
            try:
                cdp.send('Page.screencastFrameAck', {'sessionId': e['sessionId']})
            except Exception:
                pass  # a last frame can arrive after the browser closes
        cdp.on('Page.screencastFrame', on_frame)
        cdp.send('Page.startScreencast', {'format': 'jpeg', 'quality': 92, 'maxWidth': W, 'maxHeight': H, 'everyNthFrame': 1})

        def glide(x, y, ms=700):
            p.mouse.move(x, y, steps=max(8, ms // 16))

        def pause(ms):
            p.wait_for_timeout(ms)

        def spine(row, col, i):
            # Screen point of a book spine, read from the scene so the tour survives layout changes.
            return p.evaluate("""([s]) => {
                const pick = document.querySelectorAll('.plaque')[s];
                const r = pick.getBoundingClientRect(); return [r.left, r.top];
            }""", [row * 3 + col])

        # 1. The shelf: sweep across a row so books lean out as the cursor passes.
        pause(1400)
        px, py = spine(0, 0, 0)
        glide(px - 180, py - 120, 900)
        for dx in range(-180, 260, 40):
            p.mouse.move(px + dx, py - 120, steps=6)
            pause(90)
        pause(500)

        # 2. Open a design book, read, turn pages, close by clicking outside.
        gx, gy = spine(0, 1, 0)
        glide(gx - 120, gy - 120, 700)
        pause(500)
        p.mouse.click(gx - 120, gy - 120)
        pause(2900)
        nx = p.locator('#page-next').bounding_box()
        glide(nx['x'] + 22, nx['y'] + 22, 600)
        p.mouse.click(nx['x'] + 22, nx['y'] + 22)
        pause(1700)
        p.mouse.click(nx['x'] + 22, nx['y'] + 22)
        pause(1800)
        glide(90, H / 2, 600)
        p.mouse.click(90, H / 2)
        pause(2600)

        # 3. Scroll to the desk and look at the fishbowl.
        glide(W / 2, H * 0.55, 500)
        p.mouse.wheel(0, 400)
        pause(2300)
        glide(W * 0.82, H * 0.42, 900)
        pause(1400)

        # 4. The handbook: contents, jump to a chapter, turn once, close.
        glide(W * 0.16, H * 0.42, 900)
        pause(400)
        p.mouse.click(W * 0.16, H * 0.42)
        pause(3100)
        row = p.locator('.leaf .rest .toc-row').nth(7).bounding_box()
        glide(row['x'] + 120, row['y'] + 14, 700)
        pause(300)
        p.mouse.click(row['x'] + 120, row['y'] + 14)
        pause(2600)
        glide(nx['x'] + 22, nx['y'] + 22, 600)
        p.mouse.click(nx['x'] + 22, nx['y'] + 22)
        pause(1800)
        p.keyboard.press('Escape')
        pause(2400)

        # 5. The plugin phone: open a menu and a plugin, then put it down.
        phone = p.evaluate("[...document.querySelectorAll('.plaque')].find(e => e.textContent === 'Plugin phone').getBoundingClientRect().toJSON()")
        glide(phone['x'] + phone['width'] / 2, phone['y'] - 90, 800)
        pause(300)
        p.mouse.click(phone['x'] + phone['width'] / 2, phone['y'] - 90)
        pause(2000)
        for key in ['Enter', 'ArrowDown', 'ArrowDown', 'Enter']:
            p.keyboard.press(key)
            pause(650)
        pause(1200)
        p.keyboard.press('Escape')
        pause(2300)

        # 6. A vault file, then back to the shelf.
        vault = p.evaluate("[...document.querySelectorAll('.plaque')].find(e => e.textContent === 'The Vault').getBoundingClientRect().toJSON()")
        vx, vy = vault['x'] + vault['width'] / 2 - 40, vault['y'] - 170
        glide(vx, vy, 800)
        pause(300)
        p.mouse.click(vx, vy)
        pause(3000)
        p.keyboard.press('Escape')
        pause(2400)
        glide(W / 2, H * 0.5, 500)
        p.mouse.wheel(0, -400)
        pause(2600)

        cdp.send('Page.stopScreencast')
        b.close()

    # Frames arrive only when something changes, so give each its real on-screen duration.
    lines = []
    for i, (ts, data) in enumerate(frames):
        f = tmp / f'{i:05d}.jpg'
        f.write_bytes(base64.b64decode(data))
        dur = (frames[i + 1][0] - ts) if i + 1 < len(frames) else 1.0
        lines += [f"file '{f.as_posix()}'", f'duration {max(dur, 0.001):.4f}']
    lines.append(f"file '{(tmp / f'{len(frames) - 1:05d}.jpg').as_posix()}'")
    (tmp / 'list.txt').write_text('\n'.join(lines))
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', str(tmp / 'list.txt'),
                    '-vf', f'fps=30,scale={W}:{H}:flags=neighbor,format=yuv420p', '-c:v', 'libx264', '-crf', '18',
                    '-preset', 'slow', '-movflags', '+faststart', str(OUT)], check=True)
    shutil.rmtree(tmp)
    print(f'{len(frames)} frames ->', OUT)


main()
