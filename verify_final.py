import asyncio
from playwright.async_api import async_playwright

async def run():
    async def run_server():
        process = await asyncio.create_subprocess_exec(
            'python3', '-m', 'http.server', '8001'
        )
        return process

    server_process = await run_server()
    await asyncio.sleep(2)  # Wait for server to start

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})

        try:
            await page.goto('http://localhost:8001/index.html')

            # Check for key SEO elements
            title = await page.title()
            print(f"Page Title: {title}")

            # Check for form fields
            firstname = await page.is_visible('input[name="firstname"]')
            lastname = await page.is_visible('input[name="lastname"]')
            phone = await page.is_visible('input[name="phone"]')
            package = await page.is_visible('select[name="package"]')
            rodo = await page.is_visible('input[name="rodo"]')

            print(f"Form fields visibility: Firstname: {firstname}, Lastname: {lastname}, Phone: {phone}, Package: {package}, RODO: {rodo}")

            # Take screenshot
            await page.screenshot(path='final_verification.png', full_page=True)
            print("Screenshot saved as final_verification.png")

        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            await browser.close()
            server_process.kill()

if __name__ == "__main__":
    asyncio.run(run())
