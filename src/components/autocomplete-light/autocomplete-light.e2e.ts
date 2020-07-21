import { newE2EPage } from '@stencil/core/testing';

describe('autocomplete-light', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<autocomplete-light><input slot="input" /></autocomplete-light>');
    const element = await page.find('autocomplete-light');
    expect(element).toHaveClass('hydrated');
  });

  it('input opens box', async () => {
    const page = await newE2EPage();
    await page.setContent('<autocomplete-light><input slot="input" /></autocomplete-light>');
    const input = await page.find('input')
    input.press('a')
    //input.press('a')
    //await page.waitForChanges();
    //const box = await page.find('div.box')
    //expect(box)
  });
});
