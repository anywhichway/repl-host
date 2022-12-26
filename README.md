A web component for hosting REPLs

# Usage

`@anywhichway/repl-host` is designed to be loaded and used from a CDN like https://www.jsdelivr.com. It is also designed
to be loaded and instantiated by `@anywhichway/quick-component`.

Insert this line into your HTML file:

```html
<script src="https://cdn.jsdelivr.net/npm/@anywhichway/quick-component@0.0.9" component="https://cdn.jsdelivr.net/npm/@anywhichway/repl-host@0.0.9"></script>
```

Version numbers are used above to insulate your use from unexpected changes due to future enhancements. You can also use
the most recent version of the software with the code below:

```html
<script src="https://cdn.jsdelivr.net/npm/@anywhichway/quick-component.js" component="https://cdn.jsdelivr.net/npm/@anywhichway/repl-host"></script>
```

After this you can include the tag `<repl-host>` in your HTML. You can rename the tag by providing an 'as' attribute, e.g.

```html
<script src="https://cdn.jsdelivr.net/npm/@anywhichway/quick-component.js" component="https://cdn.jsdelivr.net/npm/@anywhichway/repl-host" as="md-cell"></script>
```

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

You can provide line numbers for the editors by providing the `linenumbers` boolean attribute.

```html
<repl-host css body linenumbers></repl-host>
```

You can provide initial content for any section of the REPL using slots:

```html
<repl-host head css body javascript>
    <slot name="css">h1 { font-size:small}</slot>
    <slot name="body">&lt;h1>Test&lt;/h1></slot>
</repl-host>
```

You can also use but hide a REPL section:

```html
<repl-host css="hidden" body>
    <slot name="css">h1 { font-size:small}</slot>
    <slot name="body">&lt;h1>Test&lt;/h1></slot>
</repl-host>
```

or

```html
<repl-host css body>
    <slot name="css" hidden>h1 { font-size:small}</slot>
    <slot name="body">&lt;h1>Test&lt;/h1></slot>
</repl-host>
```

And you can set a section to readonly:


```html
<repl-host css="readonly" body>
    <slot name="css">h1 { font-size:small}</slot>
    <slot name="body">&lt;h1>Test&lt;/h1></slot>
</repl-host>
```

or

```html
<repl-host css body>
    <slot name="css" readonly>h1 { font-size:small}</slot>
    <slot name="body">&lt;h1>Test&lt;/h1></slot>
</repl-host>
```

Also see the Medium article <a href="https://medium.com/@anywhichway/how-to-host-a-repl-342bc0e15f5d">How to host a REPL</a>.

# Security

REPLs are run in iframes. You can configure the iframe security using the same attributes used by an iframe but apply them tot the `repl-host` tag, i.e.
`allow`, `allowfullscren`, `allowpaymentrequest`, `referrerpolicy`, `csp`, `sandbox`. See 
https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe.

HTML is sanitized in addition to being placed in an iframe.

# Version History (reverse chronological order)

2022-10-20 v0.0.15 Make editors resizable and add placeholder text for empty editors.

2022-10-20 v0.0.14 Ensure visibility of REPL when timing issues leave it hidden by quickComponent. v0.0.13 added CodeClimate support with line numbers.

2022-10-20 v0.0.12 Fixed issue related to user changes made in 'code' section of REPL when HTML tags are included (they were getting changed to entities).

2022-10-20 v0.0.11 Made explicit value of 'false' for slot attributes work properly. Capture 'keydown' and stop propagation
in case `repl-host` is embedded in a `contentedtiable` element. Adjusted HTML body rendering and copying so that DOM coversions to and from
HTML worked properly. Added support for 'hidden' attribute. Updated docs.

2022-09-25 v0.0.10 Removed debug statements.

2022-09-25 v0.0.9 Relaxed CSS formatting even further.

2022-09-25 v0.0.8 Relaxed CSS format conditions. Updated for changes to quickComponent.

2022-09-24 v0.0.7 Shift pencil icon to left so cursor does not lay on top of it.

2022-09-13 v0.0.6 Capture clicks so higher level elements do not break component by click processing

2022-09-11 v0.0.5 Improved styling support. Updated docs.

2022-09-10 v0.0.4 Updated docs

2022-09-10 v0.0.3 Added documentation and load improvements


2022-09-13 v0.0.6 Capture clicks so higher level elements do not break component by click processing

2022-09-11 v0.0.5 Improved styling support. Updated docs.

2022-09-10 v0.0.4 Updated docs

2022-09-10 v0.0.3 Added documentation and load improvements
