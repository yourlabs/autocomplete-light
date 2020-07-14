import { newE2EPage } from '@stencil/core/testing';

describe('my-component', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<my-component></my-component>');
    const element = await page.find('my-component');
    expect(element).toHaveClass('hydrated');
  });

  it('renders changes to the value', async () => {
    const page = await newE2EPage();

    await page.setContent('<my-component></my-component>');
    const component = await page.find('my-component');
    expect(await component.getProperty('value')).toBe(undefined);

    const input = await page.find('my-component >>> input');
    expect(await input.getAttribute('value')).toBe(null);

    component.setProperty('value', 'test');
    await page.waitForChanges();
    expect(await component.getProperty('value')).toBe('test');
    expect(await input.getAttribute('value')).toBe('test');
  });
});
