"""Takes the README screenshots and runs a smoke test of every interaction.

Usage: python -m http.server 8791 (in the repo root), then python tools/shoot.py
Needs: python -m pip install playwright && python -m playwright install chromium
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = 'http://127.0.0.1:8791/index.html?motion'
OUT = Path(__file__).resolve().parent.parent / 'docs'
OUT.mkdir(exist_ok=True)
errors = []


def page_for(browser, w, h, mobile=False):
    ctx = browser.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, is_mobile=mobile, has_touch=mobile)
    p = ctx.new_page()
    p.on('console', lambda m: m.type == 'error' and errors.append(m.text))
    p.on('pageerror', lambda e: errors.append(str(e)))
    p.goto(URL)
    p.wait_for_function("document.getElementById('box-name').textContent.startsWith('Pick')")
    p.wait_for_timeout(600)
    return p


def open_from_catalog(p, name):
    p.click('#index-btn')
    p.locator('#catalog-list button', has_text=name).first.click()
    p.wait_for_function("!document.getElementById('reader').hidden || !document.getElementById('phone').hidden")
    p.wait_for_timeout(2600)


def shot(p, name):
    p.screenshot(path=str(OUT / f'{name}.png'))
    print('saved', name)


def check(cond, msg):
    if not cond:
        errors.append('CHECK FAILED: ' + msg)


with sync_playwright() as pw:
    args = ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
    try:
        b = pw.chromium.launch(channel='chrome', args=args)  # an installed Chrome, if there is one
    except Exception:
        b = pw.chromium.launch(args=args)

    p = page_for(b, 1440, 900)
    shot(p, 'shelf')
    p.mouse.move(250, 260)
    p.wait_for_timeout(500)
    check(p.locator('#read-btn').is_enabled(), 'hovering a spine selects it')

    open_from_catalog(p, 'antislop')
    check(p.locator('#page-count').inner_text().startswith('Spread 1'), 'book opens on spread 1')
    shot(p, 'book')
    p.click('#page-next')
    p.wait_for_timeout(60)
    p.evaluate("document.getAnimations().forEach(a => { a.pause(); a.currentTime = 230; })")
    shot(p, 'page-turn')
    p.evaluate("document.getAnimations().forEach(a => a.play())")
    p.wait_for_timeout(1300)
    shot(p, 'install')
    check(p.locator('.leaf .rest .copy').count() > 0, 'install command with copy button exists')
    overflow = p.evaluate("""[...document.querySelectorAll('.leaf > .rest.page')].filter(pg => {
        const lim = pg.getBoundingClientRect().bottom - 40;
        return [...pg.children].some(c => !c.classList.contains('folio') && c.getBoundingClientRect().bottom > lim + 1);
    }).length""")
    check(overflow == 0, f'{overflow} pages overflow into the page number')
    p.keyboard.press('Escape')
    p.wait_for_timeout(1800)
    check(p.locator('#reader').is_hidden(), 'Escape closes the book')
    p.wait_for_timeout(1200)

    p.click('#view-desk')
    p.wait_for_timeout(1400)
    shot(p, 'desk')
    open_from_catalog(p, 'The Vault')
    p.click('#page-next')
    p.wait_for_timeout(1300)
    shot(p, 'vault')
    p.keyboard.press('Escape')
    p.wait_for_timeout(2200)
    open_from_catalog(p, 'The Rulebook')
    p.click('#page-next')
    p.wait_for_timeout(1300)
    shot(p, 'rulebook')
    p.keyboard.press('Escape')
    p.wait_for_timeout(2200)
    open_from_catalog(p, 'Plugin phone')
    p.keyboard.press('Enter')
    p.wait_for_timeout(300)
    shot(p, 'phone')
    p.keyboard.press('Enter')
    p.wait_for_timeout(300)
    check('Notebook Navigator' in p.locator('#lcd-body').inner_text(), 'phone opens plugin details')
    p.keyboard.press('Escape')
    p.wait_for_timeout(1800)
    check(p.locator('#phone').is_hidden(), 'Escape puts the phone down')

    m = page_for(b, 390, 844, mobile=True)
    shot(m, 'mobile-shelf')
    check(m.evaluate('document.documentElement.scrollWidth') <= 390, 'no sideways scroll on mobile')
    open_from_catalog(m, 'Oracle')
    m.click('#page-next')
    m.wait_for_timeout(1300)
    shot(m, 'mobile-book')
    b.close()

print('\n'.join(errors) if errors else 'No console errors, all checks passed.')
sys.exit(1 if errors else 0)
