# A Controller Response Curve Demonstration
A demonstration of how controller analog-stick/joystick response curves work

 **>>>>>[Click Here To Try It!](https://j-l-m.github.io/controller_response_curve_test)<<<<<**
<br/><br/>
A controller response curve is a deterministic function that maps analog user input to an output value. This ouput is often used to determine the magnitude of an action the user is trying to perform.
e.g. An aim response curve uses the stick deflection as input and determines the cursor movement speed or camera turn speed in games.

## Objective:
The goal of this project was to build a simple demonstration of how reponse curves work using JavaScript and HTML.
<br/><br/>

## What it does:
It shows 3 examples of different response curves including the common Linear and Exponential curves.

Upon connecting a compatible, modern, game controller (**e.g. xbox360, xboxOne, dualshock 4**) the web page will take input from the right analog stick of the device.

Moving the right analog stick moves a cursor on screen and also moves a mark to show the response curve mapping based on how much the stick is deflected.
<br/><br/>

## How it was built:
The demo page uses JavaScript and HTML. No additional libraries were used. 

Graphs were plotted using a 3 layers of html canvas overlayed upon each other. 

The poll for connected gamepads and get input from connected gamepads, the [Gamepad web api](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API) was used. 
This is provided in up to date Firefox and Chrome browsers.


