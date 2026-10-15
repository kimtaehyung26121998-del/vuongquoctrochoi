"""Original instrumental loop: Violet Castle, 132 BPM, E harmonic minor.

Rebuild: install numpy/soundfile outside game dependencies, then run this file.
No recordings, samples, or third-party musical works are used.
"""
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tmp/audio-tools'))
import numpy as np
import soundfile as sf
import threading

RATE = 44100
BEAT = 60 / 132
BARS = 32
COUNT = round(BARS * 4 * BEAT * RATE)
mix = np.zeros((COUNT, 2), dtype=np.float64)
rng = np.random.default_rng(20261015)

def add(at, signal, volume=1, pan=0):
    indices = (round(at * RATE) + np.arange(len(signal))) % COUNT
    mix[indices, 0] += signal * volume * np.sqrt((1 - pan) / 2)
    mix[indices, 1] += signal * volume * np.sqrt((1 + pan) / 2)

def note(midi, duration, voice):
    t = np.arange(round(duration * RATE)) / RATE
    f = 440 * 2 ** ((midi - 69) / 12)
    attack = np.minimum(t / .012, 1)
    release = np.minimum((duration - t) / .08, 1)
    if voice == 'bell':
        sound = np.sin(2*np.pi*f*t) * np.exp(-t*4) + .3*np.sin(2*np.pi*f*2.76*t)*np.exp(-t*8)
    elif voice == 'bass':
        sound = (np.sin(2*np.pi*f*t) + .24*np.sin(2*np.pi*f*2*t)) * np.exp(-t*3)
    else:
        sound = sum(np.sin(2*np.pi*f*h*t + .006*np.sin(2*np.pi*4*t)) / h**1.7 for h in range(1, 7))
        sound *= np.exp(-t*2.4)
    return sound * attack * release

progression = [(40, [64,67,71]), (36,[60,64,67]), (33,[60,64,69]), (35,[59,63,66])]
melody = [76,79,78,75, 76,71,75,78, 79,76,83,81, 78,75,71,75]
for bar in range(BARS):
    root, chord = progression[(bar // 2) % 4]
    at = bar * 4 * BEAT
    energy = 1 if bar < 16 else 1.15
    # Tight low strings and rolling bass establish a clear boss rhythm.
    for step in range(8):
        add(at + step*BEAT/2, note(root, BEAT*.43, 'bass'), .24*energy)
        pitch = chord[[0,1,2,1,0,2,1,2][step]]
        add(at + step*BEAT/2, note(pitch, BEAT*.36, 'strings'), .10*energy, -.25)
        if step % 2 == 0 or bar >= 8:
            add(at + step*BEAT/2, note(pitch+12, BEAT*.8, 'bell'), .065, .4)
    for beat in [0, 1.5, 2, 3.5]:
        t=np.arange(round(.24*RATE))/RATE
        kick=np.sin(2*np.pi*(45*t + 32*.04*(1-np.exp(-t/.04)))) * np.exp(-t*20)
        add(at+beat*BEAT,kick,.4*energy)
    for beat in [1,3]:
        t=np.arange(round(.15*RATE))/RATE
        noise=rng.standard_normal(len(t))
        snare=(noise*.3 + np.sin(2*np.pi*170*t)*.45)*np.exp(-t*28)
        add(at+beat*BEAT,snare,.19)
    for step in range(8):
        t=np.arange(round(.055*RATE))/RATE
        noise=rng.standard_normal(len(t)); noise=np.diff(noise,prepend=0)
        add(at+step*BEAT/2,noise*np.exp(-t*85),.026,.25 if step%2 else -.25)
    if bar % 8 >= 4:
        for step in range(2):
            pitch=melody[((bar%8-4)*2+step+(8 if bar>=16 else 0))%16]
            add(at+step*2*BEAT,note(pitch,BEAT*1.8,'strings'),.085,.1)

# Subtle stereo echoes make the high notes feel magical rather than harsh.
dry=mix.copy()
for delay,gain in [(BEAT*.75,.13),(BEAT*1.5,.06)]:
    mix += np.roll(dry,round(delay*RATE),axis=0)[:,::-1]*gain
mix=np.tanh(mix*1.15)
mix *= .83 / max(.83, np.max(np.abs(mix)))
output=Path(__file__).resolve().parents[1]/'public/audio/music/04_lau_dai_boss_violet.ogg'
# Vorbis on Windows needs more native stack than Python's main thread has.
threading.stack_size(16 * 1024 * 1024)
errors=[]
def encode():
    try:
        sf.write(output,mix,RATE,format='OGG',subtype='VORBIS')
    except Exception as error:
        errors.append(error)
writer=threading.Thread(target=encode)
writer.start(); writer.join()
if errors:
    raise errors[0]
decoded,sample_rate=sf.read(output)
assert sample_rate==RATE and np.isfinite(decoded).all()
print(f'{output.name}: {len(decoded)/RATE:.2f}s, 132 BPM, stereo, peak {np.max(np.abs(decoded)):.3f}, {output.stat().st_size} bytes')
