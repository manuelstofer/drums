
# Drums

  A drum sequencer built with the web audio api

## Installation

Drums should be installed using component:

```
component install manuelstofer/drums
```


Play drums:
```JS

var DrumMachine = require('drums');

var drumMachine = new DrumMachine({

    element:            document.getElementById('drums'),
    context:            context,
    destination:        gainNode,
    stepsPerMinute:     240,
    steps:              16,

    files: [
        '2085__opm__kk-set1.wav',
        '26888__vexst__kick-4.wav',
        '3145__robbiesurp__dm-snare-bb6-5-close.wav',
        '406__tictacshutup__click-1-d.wav',
        '419__tictacshutup__thump-treble.wav',
        '449__tictacshutup__prac-tom.wav'
    ]
});

```
