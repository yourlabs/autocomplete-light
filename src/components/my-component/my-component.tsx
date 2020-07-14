import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  shadow: true
})
export class MyComponent {
  @Prop({
    mutable: true,
    reflect: true
  }) value: string
  @Prop() boxContent: string

  xhr: XMLHttpRequest
  timeoutId: number

  input(ev: any) {
    this.value = ev.target.value
    // clear any unset xhr
    this.xhr && this.xhr.readyState === 0 && this.xhr.abort()
    // clear any planned xhr
    this.timeoutId && window.clearTimeout(this.timeoutId)
    // plan an xhr
    this.timeoutId = window.setTimeout(this.download.bind(this), 200)
  }

  download() {
    this.xhr = new XMLHttpRequest()
    this.xhr.addEventListener('load', this.receive.bind(this))
    this.xhr.open('GET', 'https://www.mrs.beta.gouv.fr/institution/310000000/mrsrequest/iframe/?origin=http://localhost:3333/')
    this.xhr.send()
  }

  receive(ev: any) {
    this.boxContent = ev.target.response
  }

  render() {
    return <span>
      <input
        type="text"
        value={this.value}
        onInput={this.input.bind(this)}
      />
      <span class="box" innerHTML={this.boxContent} />
    </span>;
  }
}
