"""Takes the README screenshots and runs a smoke test of every interaction.

Usage: python -m http.server 8791 (in the repo root), then python tools/shoot.py
Needs: python -m pip install playwright (uses an installed Chrome, or run python -m playwright install chromium)
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = 'http://127.0.0.1:8791/index.html'
OUT = Path(__file__).resolve().parent.parent / 'docs'
OUT.mkdir(exist_ok=True)
errors = []


def page_for(browser, w, h, mobile=False, hash=''):
    ctx = browser.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, is_mobile=mobile, has_touch=mobile)
    p = ctx.new_page()
    p.on('console', lambda m: m.type == 'error' and errors.append(m.text))
    p.on('pageerror', lambda e: errors.append(str(e)))
    p.goto(URL + hash)
    p.wait_for_function("document.getElementById('box-name').textContent.length > 0 && !document.getElementById('box-name').textContent.startsWith('Dusting')")
    p.wait_for_timeout(700)
    return p


def open_from_catalog(p, name):
    p.click('#index-btn')
    p.fill('#catalog-search', name)
    p.locator('#catalog-list li:not([hidden]) button', has_text=name).first.click()
    p.wait_for_function("!document.getElementById('reader').hidden || !document.getElementById('phone').hidden")
    p.wait_for_timeout(2600)


def closed(p, sel):
    p.wait_for_timeout(2600)
    return p.locator(sel).is_hidden()


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
    check(p.locator('#motion-btn').count() == 0, 'there is no motion switch')
    shot(p, 'shelf')
    p.mouse.move(460, 270)
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
    p.mouse.click(30, 450)
    check(closed(p, '#reader'), 'clicking outside the book puts it back')

    p.mouse.move(700, 400)
    p.mouse.wheel(0, 300)
    p.wait_for_timeout(1400)
    check(p.locator('#view-desk').get_attribute('aria-pressed') == 'true', 'scrolling down walks to the desk')
    p.mouse.wheel(0, -300)
    p.wait_for_timeout(1400)
    check(p.locator('#view-shelf').get_attribute('aria-pressed') == 'true', 'scrolling up walks back to the shelf')
    p.locator('#scene').focus()
    p.keyboard.press('ArrowUp')
    p.evaluate("document.activeElement.blur()")
    p.keyboard.press('ArrowRight')
    p.wait_for_timeout(1400)
    check(p.locator('#view-desk').get_attribute('aria-pressed') == 'true', 'arrow right walks to the desk')
    shot(p, 'desk')

    open_from_catalog(p, '02 Work')
    shot(p, 'vault-file')
    p.keyboard.press('Escape')
    check(closed(p, '#reader'), 'Escape closes a file')

    open_from_catalog(p, 'The Claude Handbook')
    shot(p, 'handbook-contents')
    p.locator('.leaf .rest .toc-row').nth(7).click()
    p.wait_for_timeout(2600)
    shot(p, 'handbook-chapter')
    p.click('#page-next')
    p.wait_for_timeout(1300)
    shot(p, 'handbook')
    p.click('#close-book')
    p.wait_for_timeout(300)
    shot(p, 'closing')
    check(closed(p, '#reader'), 'Put it back closes the handbook')

    open_from_catalog(p, 'Plugin phone')
    p.keyboard.press('Enter')
    p.wait_for_timeout(300)
    shot(p, 'phone')
    p.keyboard.press('Enter')
    p.wait_for_timeout(300)
    check('Notebook Navigator' in p.locator('#lcd-body').inner_text(), 'phone opens plugin details')
    p.mouse.click(60, 450)
    check(closed(p, '#phone'), 'clicking outside puts the phone down')

    d = page_for(b, 1440, 900, hash='#/stark')
    d.wait_for_timeout(2600)
    check(not d.locator('#reader').is_hidden(), 'a #/stark link opens that book')

    m = page_for(b, 390, 844, mobile=True)
    shot(m, 'mobile-shelf')
    check(m.evaluate('document.documentElement.scrollWidth') <= 390, 'no sideways scroll on mobile')
    open_from_catalog(m, 'Oracle')
    m.click('#page-next')
    m.wait_for_timeout(1300)
    shot(m, 'mobile-book')
    m.click('#close-book')
    m.wait_for_timeout(2600)
    m.click('#view-desk')
    m.wait_for_timeout(1400)
    shot(m, 'mobile-desk')
    b.close()

print('\n'.join(errors) if errors else 'No console errors, all checks passed.')
sys.exit(1 if errors else 0)
