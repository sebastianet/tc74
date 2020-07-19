# tc74

 This project implements a web server that provides the temperature read from a TC74 chip,
 connected to my Raspberry by a i2c bus

 Events sequence is :

   *) client browser goes to http://myraspiodin.hopto.org:8123/, acessing the nodejs server on that port
   *) server provides "index.html" file - the important code is "client.js" at bottom
   *) at "DOM ready" event on the client, we fill the "load" date into the page, to diferentiate reloaded pages
   *) when user clicks the "Read Temperature" button, the request is sent to server
   *) server calls python code to get the temperature from the TC74 chip
   *) server sends temperature to client browser
   *) client fills the page with the provided value

 If the client clicks on "draw temperatures" button, the server sends up to 3 days of values,
 collected one every 30 seconds at server. Then the client draws the values on the canvas.

