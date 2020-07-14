# tc74

 This project implemets a web server that provides the temperature read from a TC74 chip,
 connected to my Raspberry by a i2c bus

 Sequence is :

   *) client browser goes to http://myraspiodin.hopto.org:8123/, acessing the nodejs server on that port
   *) server provides "index.html" file - note "client.js" code at bottom
   *) at "DOM ready" event on the client, we fill the "load" date into the page, to diferentiate reloaded pages
   *) when user clicks the "Read Temperature" button, the request is sent too server
   *) server calls python code to get the temperature from the TC74 chip
   *) server sends temperature to client browser
   *) client fills the page with the provided value

