async function openPort() {
  const filters = [
    {usbVendorId: 0x2341},
  ]
  const br = 57600;
  let serial;
  let serialPort;
  let found = false;

  if ("serial" in window.navigator) {
    serial = window.navigator.serial;
  } else {
    throw new Error("serial API is not supserialPorted!");
  }

  const serialPorts = await serial.getPorts();

  if (serialPorts.length < 1) {
    throw new Error("No connected device is found!");
  }

  serialPorts.forEach(p => {
    const { usbVendorId } = p.getInfo();
    if (usbVendorId === filters[0].usbVendorId) {
      found = true;
    }
  })

  if (!found) {
    throw new Error("No connected Arduino Uno is found!");
  }

  serialPort = await serial.requestPort(filters);
  serialPort.open({ baudRate: br })

  return serialPort;
}

function getWindowSize() {
  return [window.screen.width, window.screen.height]
}

async function serialWrite(writable, text) {
  const writer = writable.getWriter();
  const encoder = new TextEncoder();
  await writer.write(encoder.encode(text));
  writer.releaseLock();
}

async function serialRead(readable) {
  while (readable) {
    const reader = readable.getReader();
    try {
      while (true) {
        const { value, done } = await reader.read();
        console.log(value);
        if (done) {
          console.log("serialRead - done");
          break;
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      reader.releaseLock();
    }
  }
}

export { openPort, getWindowSize, serialWrite, serialRead };
