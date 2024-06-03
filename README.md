# Webdev-Task-1
# Ricochet Rumble

Ricochet Rumble is a turn-based, two-player strategy board game created by Arjun and his friend Vishrudh. The goal is to destroy your opponent's Titan by strategically moving your pieces and deflecting bullets through various Ricochet pieces. 

## Game Logic

The game consists of an 8x8 grid and includes the following pieces for each player:
- Titan
- Tank
- Ricochet
- Semi Ricochet
- Cannon

### Piece Movement
- **Titan, Tank, Ricochet, Semi Ricochet**: Can move one tile in any direction (including diagonally) or rotate.
- **Cannon**: Can move only horizontally within the base rank and shoot bullets.

### Objective
The objective of the game is to destroy the opponent's Titan by shooting a bullet from your Cannon, deflected through Ricochet pieces.

## Modes

### Normal Mode
- Players take turns to move their pieces.
- Each player has a specific amount of time per turn.
- If a player's timer runs out, the other player wins.

## Features

1. **Grid Configuration**: An 8x8 grid game board.
2. **Piece Movement**: Pieces can move to adjacent or diagonally adjacent cells or rotate.
3. **Cannon Shooting**: The Cannon shoots a circular bullet. The bullet can be deflected by Ricochet pieces.
4. **Timers**: Each player has a countdown timer that decrements during their turn.
5. **Responsive Design**: The game is mobile responsive.
6. **Pause, Resume, and Reset**: Features to pause, resume, and reset the game.
