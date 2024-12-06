// Fonction de détection de collision entre deux rectangles (utilisée pour vérifier si un joueur ou un ennemi est touché par une attaque)
function rectangularCollision({ rectangle1, rectangle2 }) {
  return (
    // Vérifie si la position de l'attaque (box) du rectangle1 touche le rectangle2 dans les axes x et y
    rectangle1.attackBox.position.x + rectangle1.attackBox.width >=
      rectangle2.position.x &&  // Le côté droit de l'attaque dépasse le côté gauche du rectangle2
    rectangle1.attackBox.position.x <=
      rectangle2.position.x + rectangle2.width &&  // Le côté gauche de l'attaque ne dépasse pas le côté droit du rectangle2
    rectangle1.attackBox.position.y + rectangle1.attackBox.height >=
      rectangle2.position.y &&  // Le bas de l'attaque dépasse le haut du rectangle2
    rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height  // Le haut de l'attaque ne dépasse pas le bas du rectangle2
  )
}

// Fonction pour déterminer le gagnant à la fin du jeu (basé sur les points de vie des joueurs)
function determineWinner({ player, enemy, timerId }) {
  // Arrête le timer lorsque la fonction de détermination du gagnant est appelée
  clearTimeout(timerId)

  // Affiche le message de victoire ou match nul sur l'écran
  document.querySelector('#displayText').style.display = 'flex'  // Affiche l'élément contenant le texte
  if (player.health === enemy.health) {
    document.querySelector('#displayText').innerHTML = 'Temps écoulé, match nul'  // Si les PV sont égaux, match nul
  } else if (player.health > enemy.health) {
    document.querySelector('#displayText').innerHTML = 'Victoire du joueur 1'  // Si le joueur 1 a plus de PV, il gagne
  } else if (player.health < enemy.health) {
    document.querySelector('#displayText').innerHTML = 'Victoire du joueur 2'  // Si le joueur 2 a plus de PV, il gagne
  }
}

// Initialisation du timer du jeu, qui commence à 60 secondes
let timer = 60
let timerId  // Variable pour stocker l'ID du timer

// Fonction pour décrémenter le timer chaque seconde
function decreaseTimer() {
  if (timer > 0) {
    // Appelle cette fonction à nouveau après 1 seconde pour réduire le timer de 1
    timerId = setTimeout(decreaseTimer, 1000)
    timer--  // Réduit le timer de 1
    // Met à jour l'affichage du timer sur l'écran
    document.querySelector('#timer').innerHTML = timer
  }

  // Lorsque le timer arrive à 0, appelle la fonction pour déterminer le gagnant
  if (timer === 0) {
    determineWinner({ player, enemy, timerId })
  }
}
