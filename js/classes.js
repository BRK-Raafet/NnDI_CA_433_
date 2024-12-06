// Classe représentant un sprite (une image animée dans le jeu)
class Sprite {
  constructor({
    position,
    imageSrc,
    scale = 1,
    framesMax = 1,
    offset = { x: 0, y: 0 }
  }) {
    // Initialisation des propriétés du sprite
    this.position = position  // Position du sprite sur l'écran
    this.width = 50  // Largeur de l'image du sprite (par défaut)
    this.height = 150  // Hauteur de l'image du sprite (par défaut)
    this.image = new Image()  // Crée une nouvelle image
    this.image.src = imageSrc  // Charge l'image depuis le chemin spécifié
    this.scale = scale  // Facteur d'échelle pour redimensionner l'image
    this.framesMax = framesMax  // Nombre total de frames dans l'animation
    this.framesCurrent = 0  // Frame actuelle de l'animation
    this.framesElapsed = 0  // Compteur pour les frames écoulées
    this.framesHold = 5  // Nombre de frames à afficher avant de changer
    this.offset = offset  // Décalage de la position du sprite
  }

  // Fonction pour dessiner l'image sur le canvas
  draw() {
    c.drawImage(
      this.image,
      this.framesCurrent * (this.image.width / this.framesMax),  // Position X de la frame à dessiner
      0,  // Position Y de la frame à dessiner
      this.image.width / this.framesMax,  // Largeur de la frame
      this.image.height,  // Hauteur de la frame
      this.position.x - this.offset.x,  // Position X du sprite
      this.position.y - this.offset.y,  // Position Y du sprite
      (this.image.width / this.framesMax) * this.scale,  // Largeur du sprite (en tenant compte de l'échelle)
      this.image.height * this.scale  // Hauteur du sprite (en tenant compte de l'échelle)
    )
  }

  // Fonction pour animer les frames
  animateFrames() {
    this.framesElapsed++  // Incrémente le compteur de frames

    // Si suffisamment de frames sont passées, passe à la frame suivante
    if (this.framesElapsed % this.framesHold === 0) {
      if (this.framesCurrent < this.framesMax - 1) {
        this.framesCurrent++  // Passe à la frame suivante
      } else {
        this.framesCurrent = 0  // Réinitialise à la première frame
      }
    }
  }

  // Fonction pour mettre à jour l'affichage du sprite (dessiner et animer)
  update() {
    this.draw()  // Dessine le sprite
    this.animateFrames()  // Anime les frames si nécessaire
  }
}

// Classe représentant un combattant, qui hérite de la classe Sprite
class Fighter extends Sprite {
  constructor({
    position,
    velocity,
    color = 'red',
    imageSrc,
    scale = 1,
    framesMax = 1,
    offset = { x: 0, y: 0 },
    sprites,
    attackBox = { offset: {}, width: undefined, height: undefined }
  }) {
    // Appel du constructeur de la classe Sprite
    super({
      position,
      imageSrc,
      scale,
      framesMax,
      offset
    })

    // Initialisation des propriétés spécifiques au combattant
    this.velocity = velocity  // Vitesse du combattant
    this.width = 50  // Largeur du combattant (par défaut)
    this.height = 150  // Hauteur du combattant (par défaut)
    this.lastKey  // Dernière touche pressée
    this.attackBox = {
      position: { x: this.position.x, y: this.position.y },  // Position de la boîte d'attaque
      offset: attackBox.offset,  // Décalage de la boîte d'attaque
      width: attackBox.width,  // Largeur de la boîte d'attaque
      height: attackBox.height  // Hauteur de la boîte d'attaque
    }
    this.color = color  // Couleur du combattant
    this.isAttacking  // Indicateur si le combattant est en train d'attaquer
    this.health = 100  // Points de vie du combattant
    this.framesCurrent = 0  // Frame actuelle de l'animation
    this.framesElapsed = 0  // Compteur pour les frames écoulées
    this.framesHold = 5  // Nombre de frames à afficher avant de changer
    this.sprites = sprites  // Sprite de différents états (idle, run, attack, etc.)
    this.dead = false  // Indicateur si le combattant est mort

    // Chargement des images des sprites (animations)
    for (const sprite in this.sprites) {
      sprites[sprite].image = new Image()
      sprites[sprite].image.src = sprites[sprite].imageSrc
    }
  }

  // Mise à jour de l'état du combattant
  update() {
    this.draw()  // Dessine l'image actuelle du combattant
    if (!this.dead) this.animateFrames()  // Anime les frames si le combattant n'est pas mort

    // Mise à jour de la position de la boîte d'attaque
    this.attackBox.position.x = this.position.x + this.attackBox.offset.x
    this.attackBox.position.y = this.position.y + this.attackBox.offset.y

    // Mise à jour de la position du combattant en fonction de la vitesse
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    // Application de la gravité
if (this.position.y + this.height >= canvas.height - 0) {
  this.velocity.y = 0; // Stopper la gravité quand le sol est atteint
  this.position.y = canvas.height - 0 - this.height; // Ajuster précisément la position pour rester sur le sol
} else {
  this.velocity.y += gravity; // Appliquer la gravité si en l'air
}
  }

  // Fonction d'attaque
  attack() {
    this.switchSprite('attack1')  // Change l'animation pour l'attaque
    this.isAttacking = true  // Indique que le combattant est en train d'attaquer
  }

  // Fonction pour subir un dégât
  takeHit() {
    this.health -= 20  // Réduit la santé du combattant

    if (this.health <= 0) {
      this.switchSprite('death')  // Si la santé atteint 0, le combattant meurt
    } else {
      this.switchSprite('takeHit')  // Sinon, affiche l'animation de "takeHit"
    }
  }

  // Fonction pour changer de sprite (animation)
  switchSprite(sprite) {
    // Si le combattant est déjà en train de mourir, ne change plus de sprite
    if (this.image === this.sprites.death.image) {
      if (this.framesCurrent === this.sprites.death.framesMax - 1)
        this.dead = true  // Marque le combattant comme mort
      return
    }

    // Empêche de changer d'animation pendant une attaque ou un "takeHit"
    if (this.image === this.sprites.attack1.image && this.framesCurrent < this.sprites.attack1.framesMax - 1)
      return
    if (this.image === this.sprites.takeHit.image && this.framesCurrent < this.sprites.takeHit.framesMax - 1)
      return

    // Change le sprite en fonction de l'animation demandée
    switch (sprite) {
      case 'idle':
        if (this.image !== this.sprites.idle.image) {
          this.image = this.sprites.idle.image
          this.framesMax = this.sprites.idle.framesMax
          this.framesCurrent = 0
        }
        break
      case 'run':
        if (this.image !== this.sprites.run.image) {
          this.image = this.sprites.run.image
          this.framesMax = this.sprites.run.framesMax
          this.framesCurrent = 0
        }
        break
      case 'jump':
        if (this.image !== this.sprites.jump.image) {
          this.image = this.sprites.jump.image
          this.framesMax = this.sprites.jump.framesMax
          this.framesCurrent = 0
        }
        break
      case 'fall':
        if (this.image !== this.sprites.fall.image) {
          this.image = this.sprites.fall.image
          this.framesMax = this.sprites.fall.framesMax
          this.framesCurrent = 0
        }
        break
      case 'attack1':
        if (this.image !== this.sprites.attack1.image) {
          this.image = this.sprites.attack1.image
          this.framesMax = this.sprites.attack1.framesMax
          this.framesCurrent = 0
        }
        break
      case 'takeHit':
        if (this.image !== this.sprites.takeHit.image) {
          this.image = this.sprites.takeHit.image
          this.framesMax = this.sprites.takeHit.framesMax
          this.framesCurrent = 0
        }
        break
      case 'death':
        if (this.image !== this.sprites.death.image) {
          this.image = this.sprites.death.image
          this.framesMax = this.sprites.death.framesMax
          this.framesCurrent = 0
        }
        break
    }
  }
}
