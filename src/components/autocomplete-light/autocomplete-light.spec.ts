import { newSpecPage } from '@stencil/core/testing';
import { AutocompleteLight } from './autocomplete-light';

describe('autocomplete-light', () => {
  it('renders', async () => {
    const {root} = await newSpecPage({
      components: [AutocompleteLight],
      html: '<autocomplete-light><input slot=input /></autocomplete-light>'
    });
    expect(root).toEqualHtml(`
      <autocomplete-light class="autocomplete-light">
        <input slot="input">
        <span class="clear" hidden="">
          ✖
        </span>
      </autocomplete-light>
    `);
  });

  it('renders with values', async () => {
    const {root} = await newSpecPage({
      components: [AutocompleteLight],
      html: `<autocomplete-light value="test"></autocomplete-light>`
    });
    expect(root).toEqualHtml(`
      <autocomplete-light class="autocomplete-light" value="test">
        <span class="clear" hidden="">
          ✖
        </span>
      </autocomplete-light>
    `);
  });
});
