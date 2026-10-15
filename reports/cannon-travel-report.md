# Refraction Cannon visible travel — 3.0.22

Jonathan requested two visibly separate one-space movements per projectile command, and a final column2-to-column1 step followed by disappearance on exit. New ideonTravel presentation frames provide ordered visual stops; the renderer shows each before the next. Exit uses the existing disintegration effect, then the incoming Pierce attack originates visually from column1. Projectiles already in column1 disappear directly. No additional player turn, damage, command, intermediate collision or gameplay field application is introduced. Existing final-destination obstruction rules remain.

Validation: 606 rules tests pass. New regressions cover intermediate Hole/card preservation, both edge columns, odd/even command counts, single Pierce job and movement-frame paths. Six isolated packaged animation checks cover normal/reduced-motion modes and two-step movement, column2 exit, column1 exit; assert actual animation calls, rendered intermediate positions, disintegration location and cleanup. Initial UI test raced startup; waiting for the home screen resolved the fixture race. User save and running game untouched.

Main design v4.205; S3 draft0.40; app and ZIP refreshed. No new full-fight balance claim. Update appears on next launch.
