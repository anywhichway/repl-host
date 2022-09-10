# repl-host
A web component for hosting REPLs

# Usage

`@anywhichway/repl-host` is designed to be loaded and used from a CDN like https://www.jsdelivr.com. It is also designed
to be loaded and instantiated by `@anywhichway/quick-component`.

Insert this line into your HTML file:

```html
<script src="https://cdn.jsdelivr.net/npm/@anywhichway/quick-component.js" component="https://cdn.jsdelivr.net/npm/@anywhichway/repl-host@0.0.3"></script>
```

Version numbers are used above to insulate your use from unexpected changes due to future enhancements. You can also use
the most recent version of the software with the code below:

```html
<script src="https://cdn.jsdelivr.net/npm/@anywhichway/quick-component.js" component="https://cdn.jsdelivr.net/npm/@anywhichway/repl-host"></script>
```

After this you can include the tag `<repl-host>` in your HTML.

# Configuration

A `repl-host` is configured with both attributes and slots. The simplest configuration is to automatically create an
empty REPL that supports head, css, body, and javascript editing using attributes with non-enumerated values.

```html
<repl-host head css body javascript></repl-host>
```

By leaving out an attribute, you will prevent the use of the named REPL section. The below is a REPL for playing with 
CSS.

```html
<repl-host css body></repl-host>
```

You can provide initial content for any section of the REPL using slots:

```html
<repl-host head css body javascript>
    <slot name="css">h1 { font-size:small}</slot>
    <slot name="body">&lt;h1>Test&lt;/h1></slot>
</repl-host>
```

# Security

REPLs are run in iframes. You can configure the iframe security using the same attributes used by an iframe, i.e.
`allow`, `allowfullscren`, `allowpaymentrequest`, `referrerpolicy`, `csp`, `sandbox`. See 
https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe.

# Version History (reverse chronological order)

2022-09-10 v0.0.4 Updated docs
2022-09-10 v0.0.3 Added documentation and load improvements
