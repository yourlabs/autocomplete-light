import { newSpecPage } from '@stencil/core/testing';
import { MyComponent } from './my-component';

describe('my-component', () => {
  it('renders', async () => {
    const {root} = await newSpecPage({
      components: [MyComponent],
      html: '<my-component></my-component>'
    });
    expect(root).toEqualHtml(`
      <my-component>
        <mock:shadow-root>
          <span>
            <input type="text">
          </span>
        </mock:shadow-root>
      </my-component>
    `);
  });

  it('renders with values', async () => {
    const {root} = await newSpecPage({
      components: [MyComponent],
      html: `<my-component value="test"></my-component>`
    });
    expect(root).toEqualHtml(`
      <my-component value="test">
        <mock:shadow-root>
          <span>
            <input type="text" value="test" />
          </span>
        </mock:shadow-root>
      </my-component>
    `);
  });
});
