#include <Servo.h>

Servo myservo;

int run = 0;

void setup() {
  Serial.begin(57600);
  myservo.attach(9);
  myservo.write(109);
}

void loop() {
  if (run == 1) {
    myservo.write(100);
  }
  if (Serial.available() > 0) {
    run = 1;
  }
}
