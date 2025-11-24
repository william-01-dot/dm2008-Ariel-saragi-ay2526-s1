// Ultrasonic Sensor → LED Brightness (Latest Version)
// Closer = Brighter, with smoothing

int usSensorPin = A0;     // ultrasonic analog pin
int ledPin = 9;           // LED output pin (PWM)

float usMaxRange = 520.0;
float dataSize = 1023.0;  // 10-bit ADC

float sensorVal = 0;
float distVal = 0;
float smoothBrightness = 0;

void setup() {
  Serial.begin(9600);
  pinMode(ledPin, OUTPUT);
}

void loop() {

  // 1. Read sensor
  sensorVal = analogRead(usSensorPin);

  // 2. Convert to distance
  distVal = sensorVal * usMaxRange / dataSize;

  // 3. Clamp distance (avoid noise)
  distVal = constrain(distVal, 2, 500);

  // 4. Map distance → brightness
  int brightness = map(distVal, 2, 500, 255, 0);  
  brightness = constrain(brightness, 0, 255);

  // 5. Smooth the brightness for nicer LED fading
  smoothBrightness = 0.85 * smoothBrightness + 0.15 * brightness;

  // 6. Output to LED
  analogWrite(ledPin, smoothBrightness);

  // 7. Debug print
  Serial.print("Distance: ");
  Serial.print(distVal);
  Serial.print(" cm | Brightness: ");
  Serial.println(smoothBrightness);

  delay(50);
}
