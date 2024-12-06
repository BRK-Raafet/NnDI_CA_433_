const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

// Ajuste la taille du canvas pour qu'elle prenne toute la taille de la fenêtre
canvas.width = window.innerWidth; // Largeur de la fenêtre
canvas.height = window.innerHeight; // Hauteur de la fenêtre

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.7;

const background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  imageSrc: './img/background.png',
});

const player = new Fighter({
  position: {
    x: 500,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  offset: {
    x: 0,
    y: 0,
  },
  imageSrc: './img/gentil/Idle.png',
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: 215,
    y: 157,
  },
  sprites: {
    idle: {
      imageSrc: './img/gentil/Idle.png',
      framesMax: 1,
    },
    run: {
      imageSrc: './img/gentil/Run.png',
      framesMax: 1,
    },
    jump: {
      imageSrc: './img/gentil/Jump.png',
      framesMax: 1,
    },
    fall: {
      imageSrc: './img/gentil/Fall.png',
      framesMax: 1,
    },
    attack1: {
      imageSrc: './img/gentil/Attack1.png',
      framesMax: 6,
    },
    takeHit: {
      imageSrc: './img/gentil/Take Hit - white silhouette.png',
      framesMax: 1,
    },
    death: {
      imageSrc: './img/gentil/Death.png',
      framesMax: 1,
    },
  },
  attackBox: {
    offset: {
      x: 100,
      y: 50,
    },
    width: 160,
    height: 50,
  },
});

const enemy = new Fighter({
  position: {
    x: 1700,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  color: 'blue',
  offset: {
    x: -50,
    y: 0,
  },
  imageSrc: './img/cpt/Idle.png',
  framesMax: 4,
  scale: 2.5,
  offset: {
    x: 215,
    y: 167,
  },
  sprites: {
    idle: {
      imageSrc: './img/cpt/Idle.png',
      framesMax: 1,
    },
    run: {
      imageSrc: './img/cpt/Run.png',
      framesMax: 1,
    },
    jump: {
      imageSrc: './img/cpt/Jump.png',
      framesMax: 1,
    },
    fall: {
      imageSrc: './img/cpt/Fall.png',
      framesMax: 1,
    },
    attack1: {
      imageSrc: './img/cpt/Attack1.png',
      framesMax: 6,
    },
    takeHit: {
      imageSrc: './img/cpt/Take hit.png',
      framesMax: 1,
    },
    death: {
      imageSrc: './img/cpt/Death.png',
      framesMax: 1,
    },
  },
  attackBox: {
    offset: {
      x: -170,
      y: 50,
    },
    width: 170,
    height: 50,
  },
});

enemy.canAttack = true; // Permet de gérer le délai entre les attaques

const keys = {
  q: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
};

decreaseTimer();

function animate() {
  window.requestAnimationFrame(animate);
  c.fillStyle = 'black';
  c.fillRect(0, 0, canvas.width, canvas.height);
  background.update();
  c.fillStyle = 'rgba(255, 255, 255, 0.15)';
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  enemy.update();

  player.velocity.x = 0;
  enemy.velocity.x = 0;

  // Mouvement du joueur
  if (keys.q.pressed && player.lastKey === 'q') {
    player.velocity.x = -5;
    player.switchSprite('run');
  } else if (keys.d.pressed && player.lastKey === 'd') {
    player.velocity.x = 5;
    player.switchSprite('run');
  } else {
    player.switchSprite('idle');
  }

  // Saut du joueur
  if (player.velocity.y < 0) {
    player.switchSprite('jump');
  } else if (player.velocity.y > 0) {
    player.switchSprite('fall');
  }

  // Mouvement automatique de l'ennemi vers le joueur
  if (enemy.position.x < player.position.x - 50) {
    enemy.velocity.x = 3; // L'ennemi se déplace vers la droite
    enemy.switchSprite('run');
  } else if (enemy.position.x > player.position.x + 50) {
    enemy.velocity.x = -3; // L'ennemi se déplace vers la gauche
    enemy.switchSprite('run');
  } else {
    // L'ennemi est proche du joueur
    enemy.velocity.x = 0;
    enemy.switchSprite('idle');

    // L'ennemi attaque automatiquement s'il est prêt
    if (enemy.canAttack && !enemy.isAttacking) {
      enemy.attack();
      enemy.canAttack = false;

      // Cooldown entre les attaques
      setTimeout(() => {
        enemy.canAttack = true;
      }, 1000); // 1 seconde
    }
  }

  // Collision et dégâts pour l'ennemi
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy,
    }) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    enemy.takeHit();
    player.isAttacking = false;

    gsap.to('#enemyHealth', {
      width: enemy.health + '%',
    });
  }

  // Si le joueur manque son attaque
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false;
  }

  // Collision et dégâts pour le joueur
  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player,
    }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 2
  ) {
    player.takeHit();
    enemy.isAttacking = false;

    gsap.to('#playerHealth', {
      width: player.health + '%',
    });
  }

  // Si l'ennemi manque son attaque
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false;
  }

  // Fin du jeu si la vie de l'un des deux tombe à zéro
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId });
  }
}

animate();

window.addEventListener('keydown', (event) => {
  if (!player.dead) {
    switch (event.key) {
      case 'd':
        keys.d.pressed = true;
        player.lastKey = 'd';
        break;
      case 'q':
        keys.q.pressed = true;
        player.lastKey = 'q';
        break;
      case 'z':
        player.velocity.y = -20;
        break;
      case ' ':
        player.attack();
        break;
    }
  }
});

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'd':
      keys.d.pressed = false;
      break;
    case 'q':
      keys.q.pressed = false;
      break;
  }
});
