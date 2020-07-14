import { newE2EPage } from '@stencil/core/testing';

describe('autocomplete-light', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<autocomplete-light></autocomplete-light>');
    const element = await page.find('autocomplete-light');
    expect(element).toHaveClass('hydrated');
  });

  it('renders changes to the value', async () => {
    const page = await newE2EPage();

    await page.setContent('<autocomplete-light></autocomplete-light>');
    const component = await page.find('autocomplete-light');
    expect(await component.getProperty('value')).toBe(undefined);

    const input = await page.find('autocomplete-light >>> input');
    expect(await input.getAttribute('value')).toBe(null);

    component.setProperty('value', 'test');
    await page.waitForChanges();
    expect(await component.getProperty('value')).toBe('test');
    expect(await input.getAttribute('value')).toBe('test');
  });
});
