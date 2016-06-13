# jquery-humanpicker
Web form control to select the number of people

![ScreenShot](https://raw.github.com/xtratio/jquery-humanpicker/master/screen/1.png)

![ScreenShot](https://raw.github.com/xtratio/jquery-humanpicker/master/screen/2.png)

## Install

Just download the latest source [ZIP](https://github.com/xtratio/jquery-humanpicker/zipball/master)
and extract the plugin assets (css and js files from dist folder) into your project.

## Usage
Simple web page (humanpicker was init via data-control attribute):

```html
<html>
<head>
    <link href="jquery.humanpicker.min.css" rel="stylesheet">
</head>
<body>
    <form id="form">
        <div id="humanpickerdemo" data-control="humanpicker"></div>
    </form>

    <script src="jquery.js"></script>
    <script src="jquery.humanpicker.min.js"></script>
</body>
</html>
```

Control generates standard html hidden inputs. For example:
```html
<input name="adults" type="hidden" value="2">
<input name="kids" type="hidden" value="2">
<input name="kidsAges[]" type="hidden" value="3">
<input name="kidsAges[]" type="hidden" value="2">
```

Get form values example via jquery:

```javascript
$("#form").serialize();
```

The result:
```
adults=2&kids=2&kidsAges[]=3&kidsAges[]=2
```

## Contributing
See [contributing page](contributing.md)

## License

MIT © xtratio
