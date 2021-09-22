import React, { Component } from 'react';
import Sketch from "react-p5";
import { openPort, getWindowSize, serialWrite } from './util';
import off from "./assets/off.png";
import original from "./assets/original.png";
import stretched from "./assets/stretched.png";
import audio from "./assets/audio.mp3";

const stage = {
    OFF: 0,
    PLAYING_S: 1,
    PLAYING_L: 2,
}

class App extends Component {
    serialPort = null;
    state = {
        portOpened: false,
        port: null,
        windowWidth: getWindowSize()[0],
        windowHeight: getWindowSize()[1],
    }
    audio = new Audio(audio);

    preload = (p5) => {
        this.off = p5.loadImage(off);
        this.original = p5.loadImage(original);
        this.stretched = p5.loadImage(stretched);
    }
    
    setup = (p5, canvasParentRef) => {
        const { windowWidth, windowHeight } = this.state;
        p5.createCanvas( windowWidth, windowHeight).parent(canvasParentRef);
        p5.fullscreen(true);

        [this.off, this.original, this.stretched].forEach(p => {
            const i = windowHeight / p.height;
            p.resize(i * p.width, i * p.height);
        })
        this.stage = stage.OFF;
        this.playing = false;
    }

    draw = (p5) => {
        const { width } = p5;
        p5.background(60);
        if (this.stage === stage.OFF) {
            if (!this.playing) {
                p5.image(this.off, (width - this.off.width) / 2, 0);
            } else {
                p5.image(this.original, (width - this.original.width) / 2, 0); 
            }
            if (p5.mouseIsPressed) {
                this.playing = true;
                setTimeout(() => {
                    this.stage = stage.PLAYING_S;
                    this.lastChanged = p5.millis();
                    serialWrite(this.serialPort.writable, 1);
                    if (!this.audioPlaying) {
                        this.audioPlaying = true;
                        this.audio.play();
                    }
                }, 1000)
            }
        } else if (this.stage === stage.PLAYING_S) {
            p5.image(this.original, (width - this.original.width) / 2, 0);
            if (p5.millis() - this.lastChanged > 700) {
                this.lastChanged = p5.millis();
                this.stage = stage.PLAYING_L;
            }
        } else {
            p5.image(this.stretched, (width - this.stretched.width) / 2, 0);
            if (p5.millis() - this.lastChanged > 700) {
                this.lastChanged = p5.millis();
                this.stage = stage.PLAYING_S;
            } 
        }
    }

    render() { 
        return (
            !this.state.portOpened
            ? <button id="rp" onClick={async () => {
                this.serialPort = await openPort();
                this.setState({
                    portOpened: true,
                })
            }}>request</button>
            :<Sketch preload={this.preload} setup={this.setup} draw={this.draw} />
        )
    }
}
 
export default App;
