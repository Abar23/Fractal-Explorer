// Constant default values used for initializing and reseting various parameters
const DEFAULT_REAL_MIN = -2.5;
const DEFAULT_REAL_MAX = 2.5;
const DEFAULT_IMAGINARY_MIN = -1.5;
const DEFAULT_IMAGINARY_MAX = 1.5;
const DEFULAT_JULIA_ANGLE = 0;
const DEFULAT_MAX_ITERATIONS = 50;
const DEFAULT_BAIL_OUT_RADIUS = 128
const DEFAULT_JULIA_RADIUS = 1;

// Constants for increasing parameters such as the iterations, bail out radius, and julia set properties
const MAX_ITERATION_STEP = 100;
const BAIL_OUT_RADIUS_STEP = 16;
const JULIA_ANGLE_STEP = 1;
const JULIA_RADIUS_STEP = .09;

// Constant to keep track of the number of fractals the program can draw
const NUM_FRACTALS = 3;
// Constants to enumerate which fractals coorespond to the value stored in the desiredFractal variable
const MANDELBROT = 0;
const JULIA = 1;
const TRICORN = 2;

// Booleans to keep track of mouse clicks. This is used for zooming purposes
var mouseWasClicked = false;
var mouseWasReleased = true;

// These values are used to store the zoom rectangle coordinates so that it can be translated to fractal space
var initialXPositionOfViewWindow = 0;
var initialYPositionOfViewWindow = 0;
var endingXPositionOfViewWindow = 0;
var endingYPositionOfViewWindow = 0;

// Set mandelbrot as the initial fractal that the program will render on start
var desiredFractal = MANDELBROT;

// Initialize the initial julia angle and radius. These control the look of the julia set fractal
var juliaRadius = DEFAULT_JULIA_RADIUS;
var juliaAngle = DEFULAT_JULIA_ANGLE;

// Itialize the max number of iteration and bail out radius used in the fractal generation algorithm
var maxIterations = DEFULAT_MAX_ITERATIONS;
var bailOutRadius = DEFAULT_BAIL_OUT_RADIUS;

// Below are the minimum and maximum values for the real and imaginary axes
var minReal = DEFAULT_REAL_MIN;
var maxReal = DEFAULT_REAL_MAX;
var minImgaginary = DEFAULT_IMAGINARY_MIN;
var maxImaginary = DEFAULT_IMAGINARY_MAX;

// Keep track of the last key pressed. Prevents continuous keyboard input so that a key press is registered once
var lastKeyPressed = '';

// Boolean to keep track of whether the program should animate
var shouldAnimate = false;

function setup() {
  createCanvas(600, 400);
  // Set angle mode to degrees for simmple julia angle step increases
  angleMode(DEGREES);
  // Render initial fractal as specified by desiredFractal
  CreateFractal(desiredFractal);
}

function draw()
{
  // Only animate the fractals if shouldAnimate is true
  if(shouldAnimate)
  {
    if(desiredFractal == JULIA)
    {
      // Increase the angle of the Julia set to animate through the various shapes
      juliaAngle += 1;
      if(juliaAngle == 361)
      {
        juliaAngle = 1;
      }
      CreateFractal(desiredFractal);
    }
    if(desiredFractal == MANDELBROT)
    {
      // Interpolate the view based upon the mouse position
      interpolateZoomToMouse();
      CreateFractal(desiredFractal);
    }
  }
}

/*
 * Interpolates the zooming window to the mouse location
 */
function interpolateZoomToMouse()
{
  initialXPositionOfViewWindow = lerp(0, mouseX, 0.05);
  endingXPositionOfViewWindow = lerp(width, mouseX, 0.05);
  initialYPositionOfViewWindow = lerp(0, mouseY, 0.05);
  endingYPositionOfViewWindow = lerp(height, mouseY, 0.05);
  UpdateViewWindow();
}

/*
 * Renders either the mandelbrot, julia, or tricorn set. The rendered fractal that is
 * chosen is based on the value in the fractalToDraw parameter. A value of 1 creates the
 * mandelbrot set, 2 creates the julia set, and 3 creates the tricorn set.
 * 
 * @param fractalToDraw
 *        An integer that contains a value that corresponds to the desired fractal that is
 *        to be rendered.
 */
function CreateFractal(fractalToDraw)
{
  // Calculate the zooming factors for the real and imaginary axes
  let realZoomFactor = (maxReal - minReal) / (width);
  let imaginaryZoomFactor = (maxImaginary - minImgaginary) / (height);
  
  // Determine which set to render
  if(fractalToDraw == MANDELBROT)
  {
    CreateMandelbrot(realZoomFactor, imaginaryZoomFactor);
  }
  else if(fractalToDraw == JULIA)
  {
    CreateJulia(realZoomFactor, imaginaryZoomFactor);
  }
  else if(fractalToDraw == TRICORN)
  {
    CreateTricorn(realZoomFactor, imaginaryZoomFactor);
  }
}

/*
 * Renders the mandelbrot set based upon the passed in zoom factors for the real and 
 * imaginary axes.
 * 
 * @param realZoomFactor
 *        A float that contains the zooming ratios along the real axis
 * 
 * @param imaginaryZoomFactor
 *        A float that contains the zooming ratios along the imaginary axis
 */
function CreateMandelbrot(realZoomFactor, imaginaryZoomFactor)
{
  // Prepare pixel array of the canvas to be loaded with RGBA values
  loadPixels();
  // Iterate through all pixels that comprise the canvas
  for(let i = 0; i < width; i++)
  {
    // Calculate the fractal space x value, real component of the complex constant c used in z^2 + c
    let c_XPosition = (realZoomFactor * i) + minReal;
    for(let j = 0; j < height; j++)
    {
      // Calculate the fractal space y value, imaginary component of the cppmlex constant c used in z^2 + c
      let c_YPosition = (imaginaryZoomFactor * j) + minImgaginary;
      /*
       * Create variables to store the x and y values that z^2+c outputs. If x^2 + y^2 is greater than the bail
       * out radius, then the pixel is not in the set
       */
       let x = 0.0;
      let y = 0.0;
      // Set itertations to 0, used for pixel color and to determine if pixels are in the mandelbrot set
      let iterations = 0;
      /*
       * Determine if pixel is within the mandelbrot set. The pixel is in the set if the number of 
       * iterations equals the maxIterations. It is not in the set if  x^2 + y^2 is equal to
       * the bail out radius
       */
       while(x * x + y * y <= bailOutRadius && iterations < maxIterations)
      {
        let tempX = x * x - y * y + c_XPosition;
        y = 2 * x * y + c_YPosition;
        x = tempX;
        iterations++;
      }

      // Fill the pixel with color based upon the iterations
      ColorPixel(iterations, i, j, x, y);
    }
  }

  // Set pixels of the canvas to the pixels generated by the set algorithm
  updatePixels();
}

/*
 * Renders the julia set based upon the passed in zoom factors for the real and 
 * imaginary axes.
 * 
 * @param realZoomFactor
 *        A float that contains the zooming ratios along the real axis
 * 
 * @param imaginaryZoomFactor
 *        A float that contains the zooming ratios along the imaginary axis
 */
function CreateJulia(realZoomFactor, imaginaryZoomFactor)
{
  // Prepare pixel array of the canvas to be loaded with RGBA values
  loadPixels();
  // Iterate through all pixels that comprise the canvas
  for(let i = 0; i < width; i++)
  {
    // Calculate the fractal space x value, real component of the complex constant c used in z^2 + c
    let c_XPosition = (realZoomFactor * i) + minReal;
    for(let j = 0; j < height; j++)
    {
      // Calculate the fractal space y value, imaginary component of the complex constant c used in z^2 + c
      let c_YPosition = (imaginaryZoomFactor * j) + minImgaginary;
      // The julia set requires that these values for the current radius be set to the real and imaginary components of c
      let x = c_XPosition;
      let y = c_YPosition;
      // Set iterations to 0
      let iterations = 0;
      // Define the dhape of the julia set using the defined julia angle and radius
      let real = cos(juliaAngle) * juliaRadius;
      let imaginary = sin(juliaAngle) * juliaRadius;
      /*
       * Determine if pixel is within the julia set. The pixel is in the set if the number of 
       * iterations equals the maxIterations. It is not in the set if  x^2 + y^2 is equal to
       * the bail out radius
       */
      while(x * x + y * y <= bailOutRadius && iterations < maxIterations)
      {
        let tempX = x * x - y * y + real;
        y = 2 * x * y + imaginary;
        x = tempX;
        iterations++;
      }

      // Fill the pixel with color based upon the iterations      
      ColorPixel(iterations, i, j, x, y);
    }
  }
  // Set pixels of the canvas to the pixels generated by the set algorithm
  updatePixels();
}

/*
 * Renders the tricorn set based upon the passed in zoom factors for the real and 
 * imaginary axes.
 * 
 * @param realZoomFactor
 *        A float that contains the zooming ratios along the real axis
 * 
 * @param imaginaryZoomFactor
 *        A float that contains the zooming ratios along the imaginary axis
 */
function CreateTricorn(realZoomFactor, imaginaryZoomFactor)
{
  // Prepare pixel array of the canvas to be loaded with RGBA values
  loadPixels();
  // Iterate through all pixels that comprise the canvas
  for(let i = 0; i < width; i++)
  {
    // Calculate the fractal space x value, real component of the complex constant c used in z^-2 + c
    let c_XPosition = (realZoomFactor * i) + minReal;
    for(let j = 0; j < height; j++)
    {
      // Calculate the fractal space y value, imaginary component of the complex constant c used in z^-2 + c      
      let c_YPosition = (imaginaryZoomFactor * j) + minImgaginary;
      // The tricorn set requires that these values for the current radius be set to the real and imaginary components of c
      let x = c_XPosition;
      let y = c_YPosition;
      // Set iterations to 0
      let iterations = 0;
       /*
       * Determine if pixel is within the tricorn set. The pixel is in the set if the number of 
       * iterations equals the maxIterations. It is not in the set if  x^2 + y^2 is equal to
       * the bail out radius
       */
      while(x * x + y * y <= bailOutRadius && iterations < maxIterations)
      {
        let tempX = x * x - y * y + c_XPosition;
        y = -2 * x * y + c_YPosition;
        x = tempX;
        iterations++;
      }

      // Fill the pixel with color based upon the iterations
      ColorPixel(iterations, i, j, x, y);
    }
  }
  // Set pixels of the canvas to the pixels generated by the set algorithm
  updatePixels();
}

/*
 * Fills in a pixel with its respective color.
 * 
 * @param iterations
 *        The iteration for the pixel that is to be colored.
 * @param pixelXPosition
 *        The x position of the pixel that is to be colored.
 * @param pixelYPosition
 *        The t position of the pixel that is to be colored.
 * @param x
 *        The x value used in the bail out radius calculation.
 * @param y
 *        The y value used in the bail out radius calculation.
 */
function ColorPixel(iterations, pixelXPosition, pixelYPosition, x, y)
{
  // Calculate the position of the pixel in the pixels array
  let pixel = ((pixelYPosition * width) + pixelXPosition) * 4;
  // Pixel is in the set
  if(iterations == maxIterations)
  {
    // Color the pixel black
    pixels[pixel] = 0;
    pixels[pixel + 1] = 0;
    pixels[pixel + 2] = 0;
  }
  else
  {
    if(iterations < maxIterations)
    {
      iterations = SmoothStep(iterations, x, y);
    }
    // Convert iterations to a float
    var precisionIterations = float(iterations);
    //Calculate and set the RGB values of the pixel
    let pixelColor1 = (precisionIterations / maxIterations) * 255;
    let pixelColor2 = ((precisionIterations * 30) / maxIterations) * 255;
    let color = lerp(pixelColor1, pixelColor2, .2);
    pixels[pixel] = color;

    pixelColor2 = ((precisionIterations * 1) / maxIterations) * 255;
    color = lerp(pixelColor1, pixelColor2, .1);
    pixels[pixel + 1] = color;

    pixelColor2 = ((precisionIterations * 20) / maxIterations) * 255;
    color = lerp(pixelColor1, pixelColor2, .9);
    pixels[pixel + 2] = color;
  }
  // Set alpha value
  pixels[pixel + 3] = 255;
}

/*
 * Performs a smooth coloring algorithm based upon the iteration that was passed in.
 *
 * @param iterations
 *        The iteration for the pixel that is to be colored.
 * @param x
 *        The x value used in the bail out radius calculation.
 * @param y
 *        The y value used in the bail out radius calculation.
 */
function SmoothStep(iterations, x, y)
{
  // This is based upon an algorithm for coloring the mandelbrot that I found online
  let logOfZ = log(x * x + y * y) / 2;
  let nu = log(logOfZ / log(2)) / log(2);
  iterations = iterations + 1 - nu;

  return iterations;
}

/*
 * Updates the view window by calculating new maximun and minimum values for
 * the real and imaginary axes of the fractal space based upon the new view
 * defined by the user
 */
function UpdateViewWindow()
{
  // Adjust new view window for inverted view cases
  if(initialYPositionOfViewWindow > endingYPositionOfViewWindow)
  {
    let temp = endingYPositionOfViewWindow;
    endingYPositionOfViewWindow = initialYPositionOfViewWindow;
    initialYPositionOfViewWindow = temp;
  }
  if(initialXPositionOfViewWindow > endingXPositionOfViewWindow)
  {
    let temp = endingXPositionOfViewWindow;
    endingXPositionOfViewWindow = initialXPositionOfViewWindow;
    initialXPositionOfViewWindow = temp;
  }

  // Map the old maximum and minimum values for the real and imaginary axes to the new window view space
  let newMinImaginary = (initialYPositionOfViewWindow / height) * (maxImaginary - minImgaginary) + minImgaginary;
  let newMaxImaginary = (endingYPositionOfViewWindow / height) * (maxImaginary - minImgaginary) + minImgaginary;
  let newMinReal = (initialXPositionOfViewWindow / width) * (maxReal - minReal) + minReal;
  let newMaxReal = (endingXPositionOfViewWindow / width) * (maxReal - minReal) + minReal;
  
  // Set the new maximums and minimums
  minReal = newMinReal;
  maxReal = newMaxReal;
  minImgaginary = newMinImaginary;
  maxImaginary = newMaxImaginary;
}

function mousePressed()
{
  if(mouseWasReleased)
  {
    // Get the current position of the mouse of the intial point for the new view window
    initialXPositionOfViewWindow = mouseX;
    initialYPositionOfViewWindow = mouseY;
    mouseWasClicked = true;
  }
}
function mouseReleased()
{
  if(mouseWasClicked)
  {
    // Get the current position of the mouse for the ending point fot the new view window
    endingXPositionOfViewWindow = mouseX;
    endingYPositionOfViewWindow = mouseY;
    mouseWasReleased = true;

    // Create new view space based upon the inital and ending view points
    UpdateViewWindow();
    // Redraw the fractal
    CreateFractal(desiredFractal);
  }
}

function keyPressed()
{
  	// Check for user input and ensure that the last is not the current key being pressed.
	if (lastKeyPressed != key) {
    if(key == 'r' || key == 'R')
    {
      // Reset all parameters to their initial values
      minReal = DEFAULT_REAL_MIN;
      maxReal = DEFAULT_REAL_MAX;
      minImgaginary = DEFAULT_IMAGINARY_MIN;
      maxImaginary = DEFAULT_IMAGINARY_MAX;
      maxIterations = DEFULAT_MAX_ITERATIONS;
      bailOutRadius = DEFAULT_BAIL_OUT_RADIUS;
      juliaRadius = DEFAULT_JULIA_RADIUS;
      juliaAngle = DEFULAT_JULIA_ANGLE;

      // Redraw fractal
      CreateFractal(desiredFractal);
    }
    else if(key == 'f' || key == 'F')
    {
      // Reset view space
      minReal = DEFAULT_REAL_MIN;
      maxReal = DEFAULT_REAL_MAX;
      minImgaginary = DEFAULT_IMAGINARY_MIN;
      maxImaginary = DEFAULT_IMAGINARY_MAX;

      // Redraw fractal
      CreateFractal(desiredFractal);
    }
    else if(key == 'e' || key == 'E')
    {
      // Incrase the bail out radius
      bailOutRadius += BAIL_OUT_RADIUS_STEP;
      // Redraw fractal
      CreateFractal(desiredFractal);
    }
    else if(key == 'd' || key == 'D')
    {
      // Decrease the bail out radius
      if(bailOutRadius - BAIL_OUT_RADIUS_STEP > 0)
      {
        bailOutRadius -= BAIL_OUT_RADIUS_STEP;
        // Redraw fractal
        CreateFractal(desiredFractal);
      }
      else if(bailOutRadius != 1)
      {
        bailOutRadius = 1;
        // Redraw fractal
        CreateFractal(desiredFractal);
      }
    }
    else if(key == 'w' || key == 'W')
    {
      // Increase the radius of the julia set
      juliaRadius += JULIA_RADIUS_STEP;
      // Redraw fractal
      CreateFractal(desiredFractal);
    }
    else if(key == 's' || key == 'S')
    {
      // Decrease the radius of the julia set
      juliaRadius -= JULIA_RADIUS_STEP;
      // Redraw fractal
      CreateFractal(desiredFractal);
    }
    else if(key == 'q' || key == 'Q')
    {
      // Increase the julia angle
      juliaAngle += JULIA_ANGLE_STEP;
      if(juliaAngle == 360)
      {
        juliaAngle = 10;
      }
      // Redraw fractal
      CreateFractal(desiredFractal);
    }
    else if(key == 'a' || key == 'A')
    {
      // Decrease the julia angle
      juliaAngle -= JULIA_ANGLE_STEP;
      if(juliaAngle < 0)
      {
        juliaAngle += 360;
      }
      // Redraw fractal
      CreateFractal(desiredFractal);
    }
    else if(key == 'ArrowUp')
    {
      //Increase the number of iterations
      maxIterations += MAX_ITERATION_STEP;
      // Redraw fractal
      CreateFractal(desiredFractal);
    }
    else if(key == 'ArrowDown')
    {
      // Decrease the number of iterations
      if(maxIterations - MAX_ITERATION_STEP > 0)
      {
        maxIterations -= MAX_ITERATION_STEP;
        // Redraw fractal
        CreateFractal(desiredFractal);
      }
    }
    else if(key == 'ArrowRight')
    {
      // Switch fractal to the next one
      desiredFractal++;
      if(desiredFractal == NUM_FRACTALS)
      {
        desiredFractal = 0;
      }

      // Redraw fractal
      CreateFractal(desiredFractal);
    }
    else if(key == 'ArrowLeft')
    {
      // Switch fractal to the previous one
      desiredFractal--;
      if(desiredFractal == -1)
      {
        desiredFractal = NUM_FRACTALS - 1;
      }

      // Redraw fractal
      CreateFractal(desiredFractal);
    }
    else if(key == 'p' || key == 'P')
    {
      shouldAnimate = !shouldAnimate;
    }
		// Save the last key that was pressed
		lastKeyPressed = key;
	} 
}

function keyReleased()
{
  // When key is released, clear what the last key pressed was
  lastKeyPressed = '';
}