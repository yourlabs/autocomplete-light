import { newSpecPage } from '@stencil/core/testing';
import { MyComponent } from './autocomplete-light';

describe('autocomplete-light', () => {
  it('renders', async () => {
    const {root} = await newSpecPage({
      components: [MyComponent],
      html: '<autocomplete-light></autocomplete-light>'
    });
    expect(root).toEqualHtml(`
      <autocomplete-light>
        <mock:shadow-root>
          <span>
            <input type="text">
            <span class="box"></span>
          </span>
        </mock:shadow-root>
      </autocomplete-light>
    `);
  });

  it('renders with values', async () => {
    const {root} = await newSpecPage({
      components: [MyComponent],
      html: `<autocomplete-light value="test"></autocomplete-light>`
    });
    expect(root).toEqualHtml(`
      <autocomplete-light value="test">
        <mock:shadow-root>
          <span>
            <input type="text" value="test" />
            <span class="box"></span>
          </span>
        </mock:shadow-root>
      </autocomplete-light>
    `);
  });
});
