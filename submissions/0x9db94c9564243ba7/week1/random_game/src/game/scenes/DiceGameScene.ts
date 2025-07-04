import Phaser from 'phaser';
import { EventBus } from '../EventBus';

export class DiceGameScene extends Phaser.Scene {
    private dice1: Phaser.GameObjects.Sprite;
    private dice2: Phaser.GameObjects.Sprite;
    private rollButton: Phaser.GameObjects.Text;
    private scoreText: Phaser.GameObjects.Text;
    private resultsText: Phaser.GameObjects.Text;
    private resultsHeaderText: Phaser.GameObjects.Text;
    private isRolling: boolean = false;
    private dice1Value: number = 1;
    private dice2Value: number = 1;
    private background: Phaser.GameObjects.Image;
    private isMobile: boolean = false;
    private rollAnimation: Phaser.Time.TimerEvent | null = null;
    private betButtons: Phaser.GameObjects.Text[] = [];
    private selectedBet: string = "FIELD";
    private stateText: Phaser.GameObjects.Text;
    
    constructor() {
        super({ key: 'DiceGameScene' });
    }
    
    preload() {
        // Load the spritesheet with correct frame dimensions
        this.load.spritesheet('dice', 'assets/dice.png', {
            frameWidth: 256,
            frameHeight: 256
        });
    }
    
    create() {
        // Check if running on mobile
        this.isMobile = this.scale.width < 768 || this.sys.game.device.os.android || this.sys.game.device.os.iOS;
        
        // Set background to fit screen
        this.background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'background');
        this.background.setDisplaySize(this.scale.width, this.scale.height);

        // Set game title with responsive positioning
        const titleY = this.isMobile ? 150 : 200;
        const title = this.add.text(this.scale.width / 2, titleY, 'FLOW Onchain Craps', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Add state text under the title
        const stateY = this.isMobile ? 190 : 240;
        this.stateText = this.add.text(this.scale.width / 2, stateY, 'State: COMEOUT', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Add back button
        const backButton = this.add.text(50, 50, '← Back', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.scene.start('MainMenu'));

        // Calculate dice positioning based on screen size - moved to left side
        const diceScale = this.isMobile ? 0.3 : 0.45;
        const diceY = this.isMobile ? this.scale.height / 2 - 50 : 300;
        const diceGap = this.isMobile ? 100 : 150;
        const diceX = this.isMobile ? this.scale.width / 3 : this.scale.width / 3;
        
        // Create two dice sprites side by side
        this.dice1 = this.add.sprite(diceX - diceGap / 2, diceY, 'dice', 0)
            .setScale(diceScale);
            
        this.dice2 = this.add.sprite(diceX + diceGap / 2, diceY, 'dice', 0)
            .setScale(diceScale);

        // Create roll button with responsive positioning
        const buttonY = this.isMobile ? this.scale.height / 2 + 100 : 450;
        this.rollButton = this.add.text(this.scale.width / 2, buttonY, 'Roll Dice', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.rollDice())
        .on('pointerover', () => this.rollButton.setStyle({ backgroundColor: '#333333' }))
        .on('pointerout', () => this.rollButton.setStyle({ backgroundColor: '#000000' }));

        // Create score text with responsive positioning
        const scoreY = this.isMobile ? this.scale.height / 2 + 170 : 550;
        this.scoreText = this.add.text(this.scale.width / 2, scoreY, 'Score: 0', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Create results header text with responsive positioning
        const headerY = this.isMobile ? this.scale.height / 2 + 220 : 600;
        this.resultsHeaderText = this.add.text(this.scale.width / 2, headerY, '', {
            fontSize: '24px',
            color: '#ffffff',
            align: 'left',
            wordWrap: { width: this.scale.width - 100 },
            fixedWidth: this.scale.width - 100,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Create results text area with responsive positioning
        const resultsY = this.isMobile ? this.scale.height / 2 + 260 : 640;
        this.resultsText = this.add.text(this.scale.width / 2, resultsY, '', {
            fontSize: '24px',
            color: '#ffffff',
            align: 'left',
            wordWrap: { width: this.scale.width - 100 },
            fixedWidth: this.scale.width - 100
        }).setOrigin(0.5);

        // Add resize handler to adjust layout when the screen size changes
        this.scale.on('resize', this.resize, this);

        // Emit scene ready event
        EventBus.emit('current-scene-ready', this);
    }
    
    // Handle resize events for responsiveness
    resize(gameSize: Phaser.Structs.Size) {
        const width = gameSize.width;
        const height = gameSize.height;
        
        this.isMobile = width < 768;
        
        // Update background
        this.background.setPosition(width / 2, height / 2);
        this.background.setDisplaySize(width, height);
        
        // Update title
        const title = this.children.getByName('title') as Phaser.GameObjects.Text;
        if (title) {
            title.setPosition(width / 2, this.isMobile ? 150 : 200);
            title.setFontSize(this.isMobile ? 24 : 32);
        }

        // Update state text
        if (this.stateText) {
            this.stateText.setPosition(width / 2, this.isMobile ? 190 : 240);
            this.stateText.setFontSize(this.isMobile ? 20 : 24);
        }
        
        // Update dice positions
        const diceScale = this.isMobile ? 0.3 : 0.45;
        const diceY = this.isMobile ? height / 2 - 50 : 300;
        const diceGap = this.isMobile ? 100 : 150;
        const diceX = this.isMobile ? width / 3 : width / 3;
        
        this.dice1.setPosition(diceX - diceGap / 2, diceY);
        this.dice1.setScale(diceScale);
        
        this.dice2.setPosition(diceX + diceGap / 2, diceY);
        this.dice2.setScale(diceScale);
        
        // Update button position
        const buttonY = this.isMobile ? height / 2 + 100 : 450;
        this.rollButton.setPosition(width / 2, buttonY);
        this.rollButton.setFontSize(32);
        
        // Update score text position
        const scoreY = this.isMobile ? height / 2 + 170 : 550;
        this.scoreText.setPosition(width / 2, scoreY);
        this.scoreText.setFontSize(32);

        // Update results header text position
        const headerY = this.isMobile ? height / 2 + 220 : 600;
        this.resultsHeaderText.setPosition(width / 2, headerY);
        this.resultsHeaderText.setWordWrapWidth(width - 100);

        // Update results text position
        const resultsY = this.isMobile ? height / 2 + 260 : 640;
        this.resultsText.setPosition(width / 2, resultsY);
        this.resultsText.setWordWrapWidth(width - 100);

        // Update betting buttons
        const gameState = (this as any).gameData?.state || "COMEOUT";
        this.updateBettingButtons(gameState);
    }
    
    update() {
        // Game loop - will be used for animations later
    }
    
    // Helper method to update score text (used by React component)
    updateScoreText(text: string) {
        if (this.scoreText) {
            // Only show the text if it's not a transaction ID
            if (!text.includes('Transaction confirmed! ID:')) {
                this.scoreText.setText(text);
            } else {
                this.scoreText.setText('Transaction confirmed!');
            }
        }
    }

    // New method to stop rolling animation with final dice values
    stopRollingAnimation(dice1Value: number, dice2Value: number) {
        if (this.rollAnimation) {
            this.rollAnimation.remove();
            this.rollAnimation = null;
        }
        
        this.isRolling = false;
        this.rollButton.setStyle({ backgroundColor: '#000000' });
        
        // Set final dice values
        this.dice1.setFrame(dice1Value - 1);
        this.dice2.setFrame(dice2Value - 1);
        
        // Reset dice position and rotation
        this.dice1.angle = 0;
        this.dice2.angle = 0;
        this.dice1.y = this.isMobile ? this.scale.height / 2 - 50 : 300;
        this.dice2.y = this.isMobile ? this.scale.height / 2 - 50 : 300;
    }

    private rollDice() {
        if (this.isRolling) return;
        
        console.log('Starting dice roll');
        this.isRolling = true;
        this.rollButton.setStyle({ backgroundColor: '#666666' });
        
        const rollInterval = 100; // Update every 100ms
        
        // Create the rolling animation
        this.rollAnimation = this.time.addEvent({
            delay: rollInterval,
            callback: () => {
                // Generate random numbers between 1 and 6 for visual effect
                const randomDice1 = Phaser.Math.Between(1, 6);
                const randomDice2 = Phaser.Math.Between(1, 6);
                
                // Update the dice sprites with random values during animation
                this.dice1.setFrame(randomDice1 - 1);
                this.dice2.setFrame(randomDice2 - 1);
                
                // Add some rotation animation
                this.dice1.angle += 45;
                this.dice2.angle -= 45;
                
                // Add some bounce effect
                this.dice1.y = (this.isMobile ? this.scale.height / 2 - 50 : 300) + Math.sin(Date.now() / 100) * 10;
                this.dice2.y = (this.isMobile ? this.scale.height / 2 - 50 : 300) + Math.sin(Date.now() / 100 + Math.PI) * 10;
            },
            callbackScope: this,
            loop: true
        });
        
        // Emit a custom event that the roll is complete
        console.log('Emitting diceRollComplete event');
        this.events.emit('diceRollComplete');
    }

    // Helper method to update results text
    updateResultsText(rollResults: { bet: string; betAmount: string; resultAmount: string; status: string; }[]) {
        if (!this.resultsText || !this.resultsHeaderText) return;
        
        if (!rollResults || rollResults.length === 0) {
            this.resultsHeaderText.setText('');
            this.resultsText.setText('');
            return;
        }

        // Create header
        const header = 'Bet'.padStart(10) + 'Status'.padStart(10) + 'Amount'.padStart(10);
        this.resultsHeaderText.setText(header);
        
        // Create rows, filtering out results with no amount
        const rows = rollResults
            .filter(result => result.resultAmount !== "nil")
            .map(result => {
                const betType = result.bet.padStart(10);
                const status = result.status.padStart(10);
                const winAmount = parseFloat(result.resultAmount).toFixed(2).padStart(10);
                return `${betType}${status}${winAmount}`;
            });

        // Set only the rows in the results text
        this.resultsText.setText(rows.join('\n'));
    }

    // New method to update betting buttons based on game state
    updateBettingButtons(gameState: string) {
        // Clear existing buttons
        this.betButtons.forEach(button => button.destroy());
        this.betButtons = [];

        // Update state text
        if (this.stateText) {
            this.stateText.setText(`State: ${gameState}`);
        }

        const buttonX = this.isMobile ? this.scale.width * 0.8 : this.scale.width * 0.8; // Moved further right
        const buttonY = this.isMobile ? 250 : 300;
        const buttonSpacing = this.isMobile ? 60 : 80;
        const horizontalSpacing = this.isMobile ? 60 : 80; // Reduced from 100/120 to 60/80

        let buttons: string[] = [];
        if (gameState === "POINT") {
            buttons = ["FIELD", "YO", "6", "5", "8", "9", "4", "10"];
            
            // Create four rows of two buttons
            buttons.forEach((bet, index) => {
                const row = Math.floor(index / 2);
                const col = index % 2;
                const x = buttonX + (col === 1 ? horizontalSpacing : -horizontalSpacing);
                const y = buttonY + (row * buttonSpacing);

                const button = this.add.text(x, y, bet, {
                    fontSize: '24px',
                    color: '#ffffff',
                    backgroundColor: bet === this.selectedBet ? '#333333' : '#000000',
                    padding: { x: 15, y: 8 }
                })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    this.selectedBet = bet;
                    this.updateBettingButtons(gameState);
                })
                .on('pointerover', () => button.setStyle({ backgroundColor: '#333333' }))
                .on('pointerout', () => button.setStyle({ 
                    backgroundColor: bet === this.selectedBet ? '#333333' : '#000000' 
                }));

                this.betButtons.push(button);
            });
        } else {
            // Default to COMEOUT state - keep vertical layout
            buttons = ["PASS", "FIELD"];
            buttons.forEach((bet, index) => {
                const button = this.add.text(buttonX, buttonY + (index * buttonSpacing), bet, {
                    fontSize: '24px',
                    color: '#ffffff',
                    backgroundColor: bet === this.selectedBet ? '#333333' : '#000000',
                    padding: { x: 15, y: 8 }
                })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    this.selectedBet = bet;
                    this.updateBettingButtons(gameState);
                })
                .on('pointerover', () => button.setStyle({ backgroundColor: '#333333' }))
                .on('pointerout', () => button.setStyle({ 
                    backgroundColor: bet === this.selectedBet ? '#333333' : '#000000' 
                }));

                this.betButtons.push(button);
            });
        }
    }
} 