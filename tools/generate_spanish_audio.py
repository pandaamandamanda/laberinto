from __future__ import annotations

import re
import wave
from array import array
from pathlib import Path

from piper import PiperVoice, SynthesisConfig

ALPHABET = tuple('ABCDEFGHIJKLMNÑOPQRSTUVWXYZ')
VOWELS = ('A', 'E', 'I', 'O', 'U')

SPANISH_LETTER_NAMES: dict[str, str] = {
    'A': 'a',
    'B': 'be',
    'C': 'ce',
    'D': 'de',
    'E': 'e',
    'F': 'efe',
    'G': 'ge',
    'H': 'hache',
    'I': 'i',
    'J': 'jota',
    'K': 'ka',
    'L': 'ele',
    'M': 'eme',
    'N': 'ene',
    'Ñ': 'eñe',
    'O': 'o',
    'P': 'pe',
    'Q': 'cu',
    'R': 'erre',
    'S': 'ese',
    'T': 'te',
    'U': 'u',
    'V': 'uve',
    'W': 'uve doble',
    'X': 'equis',
    'Y': 'ye',
    'Z': 'zeta',
}

SPECIAL_SYLLABLES: dict[str, dict[str, str]] = {
    'Q': {'E': 'que', 'I': 'qui', 'O': 'quo'},
    'C': {'A': 'ca', 'E': 'ce', 'I': 'ci', 'O': 'co', 'U': 'cu'},
    'G': {'A': 'ga', 'E': 'ge', 'I': 'gi', 'O': 'go', 'U': 'gu'},
    'Y': {'A': 'ya', 'E': 'ye', 'I': 'yi', 'O': 'yo', 'U': 'yu'},
    'Ñ': {'A': 'ña', 'E': 'ñe', 'I': 'ñi', 'O': 'ño', 'U': 'ñu'},
    'R': {'A': 'ra', 'E': 're', 'I': 'ri', 'O': 'ro', 'U': 'ru'},
}

STRONG_R_SYLLABLES = ('rra', 'rre', 'rri', 'rro', 'rru')


def to_audio_key(value: str) -> str:
    """Keep the same file naming convention as assets/js/game.js."""
    value = value.strip().lower().replace('ñ', 'ny')
    value = re.sub(r'[^a-z0-9]+', '-', value)
    return value.strip('-')


def get_pronounceable_syllable(letter: str, vowel: str) -> str:
    letter = letter.strip().upper()
    vowel = vowel.strip().upper()

    if not letter or vowel not in VOWELS:
        return ''

    if letter in VOWELS:
        return letter.lower() if letter == vowel else ''

    if letter in SPECIAL_SYLLABLES:
        return SPECIAL_SYLLABLES[letter].get(vowel, '')

    return f'{letter.lower()}{vowel.lower()}'


def synthesize_wav(
    voice: PiperVoice,
    text: str,
    wav_path: Path,
    syn_config: SynthesisConfig,
) -> None:
    wav_path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(wav_path), 'wb') as wav_file:
        voice.synthesize_wav(text, wav_file, syn_config=syn_config)


def trim_wav_silence(
    wav_path: Path,
    *,
    threshold: int = 260,
    padding_ms: int = 35,
) -> None:
    """Trim leading/trailing silence so the game can play syllables with little gap."""
    with wave.open(str(wav_path), 'rb') as source:
        params = source.getparams()
        raw_frames = source.readframes(source.getnframes())

    if params.sampwidth != 2 or not raw_frames:
        return

    samples = array('h')
    samples.frombytes(raw_frames)

    channels = max(1, params.nchannels)
    first_sample = 0
    last_sample = len(samples) - 1

    for index, sample in enumerate(samples):
        if abs(sample) >= threshold:
            first_sample = index
            break
    else:
        return

    for index in range(len(samples) - 1, -1, -1):
        if abs(samples[index]) >= threshold:
            last_sample = index
            break

    padding_samples = int(params.framerate * padding_ms / 1000) * channels
    start_sample = max(0, first_sample - padding_samples)
    end_sample = min(len(samples), last_sample + padding_samples + 1)

    # Preserve full frames for multi-channel audio.
    start_sample -= start_sample % channels
    end_sample += (channels - (end_sample % channels)) % channels
    end_sample = min(len(samples), end_sample)

    trimmed = samples[start_sample:end_sample]
    with wave.open(str(wav_path), 'wb') as target:
        target.setparams(params)
        target.writeframes(trimmed.tobytes())


def generate_spanish_audio(
    model_path: str | Path,
    output_root: str | Path = 'assets/audio/spanish',
) -> list[Path]:
    model_path = Path(model_path)
    output_root = Path(output_root)

    if not model_path.exists():
        raise FileNotFoundError(f'No existe el modelo Piper: {model_path}')

    voice = PiperVoice.load(str(model_path))
    syn_config = SynthesisConfig(
        length_scale=0.95,
        noise_scale=0.65,
        noise_w_scale=0.75,
        volume=1.0,
        normalize_audio=True,
    )

    generated: list[Path] = []

    for letter in ALPHABET:
        spoken_name = SPANISH_LETTER_NAMES[letter]
        wav_path = output_root / 'letters' / f'{to_audio_key(letter)}.wav'
        synthesize_wav(voice, spoken_name, wav_path, syn_config)
        trim_wav_silence(wav_path)
        generated.append(wav_path)

    syllables: set[str] = set()
    for letter in ALPHABET:
        for vowel in VOWELS:
            syllable = get_pronounceable_syllable(letter, vowel)
            if syllable:
                syllables.add(syllable)

    syllables.update(STRONG_R_SYLLABLES)

    for syllable in sorted(syllables, key=lambda value: (len(value), value)):
        # Use lowercase text so Piper reads Spanish syllables, not uppercase acronyms.
        wav_path = output_root / 'syllables' / f'{to_audio_key(syllable)}.wav'
        synthesize_wav(voice, syllable.lower(), wav_path, syn_config)
        trim_wav_silence(wav_path)
        generated.append(wav_path)

    return generated


if __name__ == '__main__':
    generated_files = generate_spanish_audio(
        model_path='es_ES-carlfm-x_low.onnx',
        output_root='assets/audio/spanish',
    )

    for path in generated_files:
        print(path)

    print(f'\nTotal generado: {len(generated_files)} archivos WAV')
