import kaplay from "kaplay";
import "kaplay/global";

// Set high score before the game run loop starts
let highScore = localStorage.getItem("highScore") || 0
localStorage.setItem("highScore", highScore)

SNYK_COLOR_PURPLE = [229, 85, 172];
SNYK_COLOR_ORANGE = [249, 144, 72];

// initialize context
kaplay({
  crisp: false,
  width: 1080,
  height: 720,
  background: [9,5,45],
  scale: 1,
  canvas: document.getElementById('game'),
})

// loadFont("apl386", "/fonts/VCR_OSD_MONO_1001.ttf");
loadFont("apl386", "/fonts/apl386.ttf");
loadFont('jersey', '/fonts/Jersey10-Regular.ttf');

loadSprite("background", "sprites/bg-snyk-terrain.png")

loadSprite("background-menu", "sprites/bg-snyk-menu.png")

loadSprite("logo", "sprites/vuln-vortex-logo-start.svg")

// Work created by me
loadPedit("npmbox", "sprites/npmbox-animated.pedit")
loadPedit("npmbox-dev", "sprites/npmbox-dev.pedit");
loadPedit("rail", "sprites/rail.pedit")
loadPedit("rail2", "sprites/rail.pedit")

loadSprite("Patch-Jumper", "sprites/power-up.png")
loadSprite("Mode-protected", "sprites/protected.png");
loadSprite("Mode-filterdevs", "sprites/ai-fix.png");

// official Snyk source
loadSprite("dog", "sprites/dog_brown.png", {
  sliceX: 3,
  sliceY: 2,
  anims: {
    idle: {
      from: 0, to: 0
    },
    run: {
      from: 0, to: 2, loop: true
    }
  }
})

// source music from mixkit: https://mixkit.co/free-stock-music/
loadSound("jump-fast", "sounds/fast-simple-chop-5-6270.mp3");
loadSound("score", "sounds/score.mp3");
loadSound("soundThunder", "sounds/mixkit-distant-thunder-explosion-1278.wav");
loadSound("soundPackageCollide", "sounds/mixkit-epic-impact-afar-explosion-2782.wav");
loadSound("soundItem1", "sounds/mixkit-fast-small-sweep-transition-166.wav");
loadSound("soundItem2", "sounds/mixkit-fairy-teleport-868.wav");
loadSound("soundItem3", "sounds/mixkit-magic-sparkle-whoosh-2350.wav");
loadSound("game-background-music2", "sounds/game-background-music2.mp3");
loadSound("game-nonplay", "sounds/deep-ambient-version-60s-9889.mp3");
const gameMusic = play('game-background-music2', {loop: true, volume: 0.6})
const soundThunder = play('soundThunder', {loop: false, volume: 0.9})

let gameMusicIntro

let score = 0
let packagesAnimType = 'regular'
let playerProtected = false
let devDepsCounter = 0

// jump mode:
const scorePhase1 = 1200
// protected mode:
const scorePhase2 = 2000
// devdeps:
const scorePhase3 = 2800
// currently unused:
// const scorePhase4 = 5000
// const scorePhase5 = 10000

const vulnerablePackagesList = [
  {
    name: 'node-forge',
    cve: 'CVE-2022-0122',
    vulnerability: 'Open Redirect',
    link: 'https://security.snyk.io/vuln/SNYK-JS-NODEFORGE-2330875',
  },
  {
    name: 'uppy',
    cve: 'CVE-2022-0086',
    vulnerability: 'Server-side Request Forgery',
    link: 'https://security.snyk.io/vuln/SNYK-JS-UPPY-2329723',
  },
  {
    name: 'mermaid',
    cve: 'CVE-2021-43861',
    vulnerability: 'Cross-site Scripting',
    link: 'https://security.snyk.io/vuln/SNYK-JS-MERMAID-2328372',
  },
  {
    name: 'momnet',
    cve: 'SNYK-JS-MOMNET-2324797',
    vulnerability: 'Malicious Package',
    link: 'https://security.snyk.io/vuln/SNYK-JS-MOMNET-2324797',
  },
  {
    name: 'js-data',
    cve: 'CVE-2021-23574',
    vulnerability: 'Prototype Pollution',
    link: 'https://security.snyk.io/vuln/SNYK-JS-JSDATA-1584361',
  },
  {
    name: 'json-2-csv',
    cve: 'SNYK-JS-JSON2CSV-1932013',
    vulnerability: 'CSV Injection',
    link: 'https://security.snyk.io/vuln/SNYK-JS-JSON2CSV-1932013',
  },
  {
    name: 'wafer-form',
    cve: 'SNYK-JS-WAFERFORM-2313722',
    vulnerability: 'Malicious Package',
    link: 'https://security.snyk.io/vuln/SNYK-JS-WAFERFORM-2313722',
  },
  {
    name: 'md-to-pdf',
    cve: 'CVE-2021-23639',
    vulnerability: 'Remote Code Execution',
    link: 'https://security.snyk.io/vuln/SNYK-JS-MDTOPDF-1657880',
  },
  {
    name: 'http-server-node',
    cve: 'CVE-2021-23797',
    vulnerability: 'Directory Traversal',
    link: 'https://security.snyk.io/vuln/SNYK-JS-HTTPSERVERNODE-1727656',
  },
  {
    name: 'next',
    cve: 'CVE-2021-43803',
    vulnerability: 'Denial of Service',
    link: 'https://security.snyk.io/vuln/SNYK-JS-NEXT-2312745',
  },
  {
    name: 'github-todos',
    cve: 'CVE-2021-44684',
    vulnerability: 'Command Injection',
    link: 'https://security.snyk.io/vuln/SNYK-JS-GITHUBTODOS-2311792',
  },
  {
    name: 'hexo',
    cve: 'CVE-2021-25987',
    vulnerability: 'Cross-site Scripting',
    link: 'https://security.snyk.io/vuln/SNYK-JS-HEXO-1932976',
  },
  {
    name: 'json-schema',
    cve: 'CVE-2021-3918',
    vulnerability: 'Prototype Pollution',
    link: 'https://security.snyk.io/vuln/SNYK-JS-JSONSCHEMA-1920922',
  },
  {
    name: 'coa',
    cve: 'SNYK-JS-COA-1911118',
    vulnerability: 'Malicious Package',
    link: 'https://security.snyk.io/vuln/SNYK-JS-COA-1911118',
  },
  {
    name: 'rc',
    cve: 'SNYK-JS-RC-1911120',
    vulnerability: 'Malicious Package',
    link: 'https://security.snyk.io/vuln/SNYK-JS-RC-1911120',
  },
  {
    name: 'tinymce',
    cve: 'SNYK-JS-TINYMCE-1910225',
    vulnerability: 'Cross-site Scripting',
    link: 'https://security.snyk.io/vuln/SNYK-JS-TINYMCE-1910225',
  },
  {
    name: 'jquery-ui',
    cve: 'CVE-2021-41184',
    vulnerability: 'Cross-site Scripting',
    link: 'https://security.snyk.io/vuln/SNYK-JS-JQUERYUI-1767175',
  },
  {
    name: 'fastify-static',
    cve: 'CVCVE-2021-2296E',
    vulnerability: 'Open Redirect',
    link: 'https://security.snyk.io/vuln/SNYK-JS-FASTIFYSTATIC-1728398',
  },
  {
    name: 'teddy',
    cve: 'CVE-2021-23447',
    vulnerability: 'Cross-site Scripting',
    link: 'https://security.snyk.io/vuln/SNYK-JS-TEDDY-1579557',
  },
  {
    name: 'marked',
    cve: 'CVE-2016-10531',
    vulnerability: 'Cross-site Scripting',
    link: 'https://security.snyk.io/vuln/npm:marked:20150520',
  },
  {
    name: 'dustjs-linkedin',
    cve: 'npm:dustjs-linkedin:20160819',
    vulnerability: 'Code Injection',
    link: 'https://security.snyk.io/vuln/npm:dustjs-linkedin:20160819',
  },
  {
    name: 'typeorm',
    cve: 'CVE-2020-8158',
    vulnerability: 'Prototype Pollution',
    link: 'https://security.snyk.io/vuln/SNYK-JS-TYPEORM-590152',
  },
  {
    name: 'moment',
    cve: 'CVE-2017-18214',
    vulnerability: 'Regular Expression Denial of Service',
    link: 'https://security.snyk.io/vuln/npm:moment:20170905',
  },
  {
    name: 'react-bootstrap-table',
    cve: 'CVE-2021-23398',
    vulnerability: 'Cross-site Scripting',
    link: 'https://security.snyk.io/vuln/SNYK-JS-REACTBOOTSTRAPTABLE-1314285',
  },
  {
    name: 'react-tooltip',
    cve: 'SNYK-JS-REACTTOOLTIP-72363',
    vulnerability: 'Cross-site Scripting',
    link: 'https://security.snyk.io/vuln/SNYK-JS-REACTTOOLTIP-72363',
  },
  {
    name: 'react-svg',
    cve: 'npm:react-svg:20180427',
    vulnerability: 'Cross-site Scripting',
    link: 'https://security.snyk.io/vuln/npm:react-svg:20180427',
  },
  {
    name: 'jspdf',
    cve: 'CVE-2021-23353',
    vulnerability: 'Regular Expression Denial of Service',
    link: 'https://security.snyk.io/vuln/SNYK-JS-JSPDF-1073626',
  }
]

function getRandomPackageData() {
  const maxRange = vulnerablePackagesList.length - 1
  return vulnerablePackagesList[randi(0, maxRange)]
}

function getPackageRandomSize() {
  return rand(0.7, 1.4)
}

scene("game", () => {
  gameMusicIntro.stop()

  let SPAWN_PACKAGES_TOP_SPEED = 3.5
  gameMusic.play()

  let helpers = ['Patch-Jumper', 'Protected',  'Protected', 'Mode-filterdevs', 'Mode-filterdevs', 'Protected', 'Mode-filterdevs']
  score = 0
  playerProtected = false
  packagesAnimType = 'regular'

  let JUMP_FORCE = 705
  const FLOOR_HEIGHT = 48
  const MOVE_SPEED = 200
  
  // define gravity
	setGravity(2400)

  // add Snyk background
  add([
    sprite("background"),
    pos(0, 0),
    scale(1)
  ])

  const scoreLabel = add([
    text(score),
    pos(24, 24),
    fixed()
  ])

  // increment score every frame
  onUpdate(() => {
    score++
    scoreLabel.text = score
  })

  // add the bottom solid platform
  platform = add([ 
    rect(width(), FLOOR_HEIGHT),
    pos(0, height() - FLOOR_HEIGHT),
    outline(4),
    area(),
    body({ isStatic: true }),
    color(128,0,128)
  ])

  // add a character to screen
  const player = add([
    sprite("dog"),
    pos(80, 40),
    area(),
    body(),
    scale(1),
    "player",
  ])
  player.flipX = true
  
  // enable camera position movement
  // player.action(() => {
  // center camera to player
  // var currCam = camPos();
  // if (currCam.x < player.pos.x) {
  //     camPos(player.pos.x, currCam.y);
  //   }
  // });

  onDraw("player", () => {
    if (player.pos.x <0) {
      player.moveTo(0, player.pos.y)
    } else if (player.pos.x > width()-player.width) {
      player.moveTo(width()-player.width, player.pos.y)
    }
  })

  function jump() {
    if (player.isGrounded()) {
      play('jump-fast', {loop: false})
      player.jump(JUMP_FORCE)
      player.play('idle')
    }
  }

  onKeyPress("space", jump)
  onKeyPress("up", jump)
  onMousePress(jump)


  onKeyPress('right', () => {
    player.flipX = true
  })

  onKeyPress('left', () => {
    player.flipX = false
  })

  onKeyRelease('left', () => {
    player.play('run')
  })

  onKeyRelease('right', () => {
    player.play('run')
  })

  onKeyDown('right', () => {
    player.move(MOVE_SPEED, 0)
  })

  onKeyDown('left', () => {
    player.move(-MOVE_SPEED, 0)
  })

  player.onCollide("package", (element) => {
    if (playerProtected !== true) {
      addKaboom(player.pos)
      play('soundPackageCollide', {loop: false})
      shake()
      go("lose", { packageInfo: element.packageInfo})
    }
  })

  player.onCollide("Patch-Jumper", (element) => {
    play('soundItem3', {loop: false})
    addKaboom(player.pos)
    shake()

    // upgrade the jump force!
    JUMP_FORCE = 1000
    
    // remove the helper now that it's received
    helperIndex = helpers.indexOf('Patch-Jumper')
    helpers.splice(helperIndex, 1)

    destroy(element)
  })

  player.onCollide("DevDeps", (element) => {
    addKaboom(player.pos)
    play('soundPackageCollide', {loop: false})
    shake()
    go("lose", { packageInfo: element.packageInfo})
  })

  player.onCollide("Mode-protected", (element) => {
    play('soundItem2', {loop: false})
    // remove the helper now that it's received
    helperIndex = helpers.indexOf('Protected')
    helpers.splice(helperIndex, 1)

    addKaboom(player.pos)
    shake(5)
    destroy(element)

    // new spawned packages should have the "weak" animation
    packagesAnimType = 'weak'
    playerProtected = true
    get('package').forEach((element) => {
      element.play(packagesAnimType);
    });
    // and after 5 seconds it expires back to "regular"
    wait(5, () => {
      packagesAnimType = 'regular'
      get('package').forEach((element) => {
        element.play(packagesAnimType);
      });
      playerProtected = false
    })
  })

  player.onCollide("Mode-filterdevs", (element) => {
    play('soundItem3', {loop: false})
    // remove the helper now that it's received
    helperIndex = helpers.indexOf('Mode-filterdevs')
    helpers.splice(helperIndex, 1)

    addKaboom(player.pos)
    shake(5)
    destroy(element)

    destroyAll("DevDeps")
  })

  let colorama = 0
  let coloramaIndex = [BLUE, MAGENTA]
  let radiusProtector = 40

  onDraw(() => {
    if (playerProtected) {
      drawCircle({
          pos: vec2(player.pos.x + 40, player.pos.y + 20),
          radius: radiusProtector,
          opacity: 0,
          outline: { color: coloramaIndex[colorama], width: 1 },
      })
    }
	})

  loop(0.1, () => {
    colorama = Number(!colorama)
    radiusProtector++
    if (radiusProtector >= 55) {
      radiusProtector = 45
    }
  })

  loop(5, () => {
    // Phase2 begins
    if (score >= scorePhase2) {
      if (helpers.includes('Protected')) {
        add([
          sprite("Mode-protected"),
          area(),
          anchor('botleft'),
          pos(width(), 80),
          move(LEFT, 130),
          "Mode-protected",
          fixed(),
          body({ isStatic: true }),
          scale(0.7),
          body()
        ])
      }
    }
    // Phase2 ends
  })

  // play thunder sound effect
  loop(15, () => {
    soundThunder.stop()
    soundThunder.play()
  })

  loop(4, () => {
    // Phase3 begins
    if (score >= scorePhase3 && devDepsCounter >= 6) {
      devDepsCounter = 0
      if (helpers.includes('Mode-filterdevs')) {
        add([
          sprite("Mode-filterdevs"),
          area(),
          anchor('botleft'),
          pos(width(), 80),
          move(LEFT, 150),
          "Mode-filterdevs",
          fixed(),
          body({ isStatic: true }),
          scale(2.5),
          body()
        ])
      }
    }
    // Phase3 ends
  })

  loop(1.7, () => {
    // Phase3 begins
    if (score >= scorePhase3) {
      if (helpers.includes('Mode-filterdevs')) {
        devDepsCounter++
        
        const randomPackage = getRandomPackageData()
        add([
          sprite("npmbox-dev"),
          area(),
          anchor('botleft'),
          pos(width(), height() - FLOOR_HEIGHT),
          move(LEFT, 150),
          "DevDeps",
          fixed(),
          body({ isStatic: true }),
          scale(0.5),
          { packageInfo: randomPackage }
        ])
      }
    }
    // Phase3 ends
  })

  let railTimeout = 1
  loop(1, () => {

    // if this helper doesn't exist in our array box, then it means the user
    // already took it. great for them, let's add some rails now to the screen
    if (!helpers.includes('Patch-Jumper')) {
      // print rails to the screen
      let randomNumber = randi(0, 30)

      if (railTimeout > 0) {
        railTimeout -= 1
        return
      }

      if (randomNumber % 5 === 0) {
        // on the first rail apperance we want to increase
        // the speed in which packages are being spawned
        SPAWN_PACKAGES_TOP_SPEED = 2.2

        railTimeout = 1
        add([
          sprite("rail2"),
          anchor('botleft'),
          pos(width() + 50, height() - (FLOOR_HEIGHT * 4)),
          move(LEFT, 180),
          "rail",
          scale(5),
          area(),
          fixed(),
          body({ isStatic: true })
        ])
      }
    }
  })

  loop(3, () => {
    // Phase1 begins
    if (score >= scorePhase1 && score <= scorePhase2) {
      // show the patch jumper helper
      if (helpers.includes('Patch-Jumper')) {
        const PatchJumper = add([
          sprite("Patch-Jumper"),
          area(),
          anchor('botleft'),
          pos(width(), height() - (FLOOR_HEIGHT * 2.5)),
          move(LEFT, 200),
          "Patch-Jumper",
          fixed(),
          body({ isStatic: true }),
          scale(0.5)
        ])
      }
    }
  })  

  onUpdate("Patch-Jumper", (element) => {
    if (element.pos.x < 0) {
      destroy(element)
    }
  })

  onUpdate("package", (element) => {
    if (element.pos.x < 0) {
      destroy(element)
    }
  })

  onUpdate("rail", (element) => {
    // scaled element to be 5x so need to account for bigger size
    // of just element.width
    if (element.pos.x < -300) {
      destroy(element)
    }
  })

  onUpdate("label", (element) => {
    if (element.pos.x < 0) {
      destroy(element)
    }
  })

  onUpdate("DevDeps", (element) => {
    if (element.pos.x < 0) {
      destroy(element)
    }
  })

  onUpdate("Mode-filterdevs", (element) => {
    if (element.pos.x < 0) {
      destroy(element)
    }
  })

  onUpdate("Mode-protected", (element) => {
    if (element.pos.x < 0) {
      destroy(element)
    }
  })

  function spawnPackages() {

    const randomPackage = getRandomPackageData()
    
    const npmPackage = add([
      sprite("npmbox", {anim: packagesAnimType}),
      area(),
      anchor('botleft'),
      pos(width(), height() - FLOOR_HEIGHT),
      move(LEFT, 240),
      "package",
      scale(1),
      { packageInfo: randomPackage },
    ])

    
    
    add([
      text(randomPackage.name, { size: '22', font: 'apl386' }),
      move(LEFT, 240),
      anchor('botleft'),
      color(255, 255, 255),
      'label',
      pos(width()-20, height() - 100),
      scale(getPackageRandomSize())
    ])

    wait(rand(0.8, SPAWN_PACKAGES_TOP_SPEED), () => {
      spawnPackages()
    })
  }

  spawnPackages()

}) //end game scene

scene("lose", ({packageInfo}) => {
  gameMusic.stop()
  gameMusicIntro.play()
  
  // add Snyk background
  add([
    sprite("background-menu"),
    pos(0, 0),
    scale(0.4)
  ])
  
  add([
    pos(width()/2, 80),
    sprite("logo"),
    rotate(0),
    area(),
    anchor('center'),
    scale(0.2),
  ])

  const YPosStartText = 200
  add([
		text("GAME OVER"),
    pos(width() / 2, YPosStartText),
    scale(1.3),
		anchor("center"),
	])

  const vulnTitle = String(packageInfo.vulnerability).toUpperCase();
  const vulnCVE = packageInfo.cve
  const vulnPackageName = packageInfo.name
  const vulnURL = packageInfo.link

  if (score > parseInt(highScore)) {
    localStorage.setItem("highScore", score)
    highScore = score
  }

	add([
		text(`YOUR SCORE: ${score}`),
		pos(width() / 2, YPosStartText + 50),
		scale(0.6),
		anchor("center"),
    color(...SNYK_COLOR_PURPLE)
	])

  add([
    text(`HIGH SCORE: ${highScore}`),
    pos(width() / 2, YPosStartText + 80),
    scale(0.6),
    anchor("center"),
    color(...SNYK_COLOR_ORANGE)
  ])

  const btnKilledByVuln = add([
    text(`UH OH! A SECURITY VULNERABILITY TOOK YOU DOWN :(\n\nTHE SNYK VULNERABILITY DATABASE HELP TEAMS\nSTAY AHEAD OF RISKS LIKE [orange]${vulnTitle}[/orange]\nWITH REAL TIME DATA AND INSIGHTS`, {
      font: 'jersey',
      align: 'center',
      styles: {
        "orange": {
          color: rgb(...SNYK_COLOR_ORANGE),
        },
      }
    }),
		pos(width() / 2, YPosStartText + 220),
    area({ cursor: "pointer", height: 250 }),
		scale(1),
		anchor("center"),
	])

  add([
		text('Media assets credit to: opengameart.org, mixkit.co.'),
		pos(width() / 2, height() / 2 + 320),
		scale(0.2),
		anchor("center"),
	])

  const restartGame = () => {
    score = 0
    go("game")
  }

  const btnRestart = add([
    rect(150, 55, { fill: false }),
    pos((width()/2) - 110, YPosStartText + 400),
    area(),
    scale(1),
    anchor("center"),
    outline(2, rgb(...SNYK_COLOR_PURPLE)),
    color(...SNYK_COLOR_PURPLE),
  ]);

  // add a child object that displays the text
  btnRestart.add([
      text('RESTART GAME', {
        size: 20,
        font: 'jersey',
      }),
      anchor("center"),
      color(255, 255, 255),
  ]);

  btnRestart.onClick(restartGame);

  const btnSeeVulnerability = add([
    rect(200, 55, { fill: false }),
    pos((width()/2) + 90, YPosStartText + 400),
    area(),
    scale(1),
    anchor("center"),
    outline(2, rgb(...SNYK_COLOR_ORANGE)),
    color(...SNYK_COLOR_ORANGE),
  ]);

  // add a child object that displays the text
  btnSeeVulnerability.add([
      text('OPEN VULNERABILITY', {
        size: 20,
        font: 'jersey',
      }),
      anchor("center"),
      color(255, 255, 255),
  ]);

  btnSeeVulnerability.onClick(restartGame);


  // const btnRestart = add([
	// 	text("Restart"),
  //   pos(width() / 2, height() / 2 + 50),
	// 	area({ cursor: "pointer", }),
	// 	scale(0.5),
	// 	anchor("center"),
	// ])

  // const btnLearnMore = add([
	// 	text("See vulnerability"),
  //   pos(width() / 2, height() / 2 + 130),
	// 	area({ cursor: "pointer", }),
	// 	scale(0.5),
	// 	anchor("center"),
	// ])

  // --restart
  // btnRestart.onClick(restartGame)
  // btnRestart.onUpdate(() => {
	// 	if (btnRestart.isHovering()) {
	// 		const t = time() * 10
	// 		btnRestart.color = rgb(
	// 			wave(0, 255, t),
	// 			wave(0, 255, t + 2),
	// 			wave(0, 255, t + 4),
	// 		)
	// 		btnRestart.scale = vec2(1.2)
	// 	} else {
	// 		btnRestart.scale = vec2(1)
	// 		btnRestart.color = rgb(255, 63, 198)
	// 	}
	// })

  // onKeyPress('space', restartGame)

  // // --see vulnerability
  // btnLearnMore.onClick(() => window.open(vulnURL, '_blank'))
  // btnLearnMore.onUpdate(() => {
	// 	if (btnLearnMore.isHovering()) {
	// 		const t = time() * 10
	// 		btnLearnMore.color = rgb(
	// 			wave(0, 255, t),
	// 			wave(0, 255, t + 2),
	// 			wave(0, 255, t + 4),
	// 		)
	// 		btnLearnMore.scale = vec2(1.2)
	// 	} else {
	// 		btnLearnMore.scale = vec2(1)
	// 		btnLearnMore.color = rgb(249, 144, 72)
	// 	}
	// })

  // // --killed by vuln
  // btnKilledByVuln.onClick(() => window.open(vulnURL, '_blank'))

})

scene('credits-0', () => {

  // add Snyk background
  add([
    sprite("background-menu"),
    pos(0, 0),
    scale(0.4)
  ])

  gameMusic.stop()
  soundThunder.stop()

  wait(1, () => {
    focus()

    add([
      pos(width()/2, height()/2 - 100),
      sprite("logo"),
      rotate(0),
      area(),
      anchor('center'),
      scale(1),
    ])

    const txt = 'PRESS SPACE TO START'
    const btn = add([
      rect(250, 55, { fill: false }),
      // pos(p),
      pos(width()/2, height()/2 + 180),
      area(),
      scale(1),
      anchor("center"),
      outline(2, rgb(...SNYK_COLOR_PURPLE)),
      color(...SNYK_COLOR_PURPLE),
    ]);

    // add a child object that displays the text
    btn.add([
        text(txt, {
          size: 20,
          font: 'jersey',
        }),
        anchor("center"),
        color(255, 255, 255),
    ]);

    btn.onHoverUpdate(() => {
      const t = time() * 10;
      btn.outline = { width: 2, color: rgb(wave(0, 255, t), wave(0, 255, t + 2), wave(0, 255, t + 4)) };
      // btn.scale = vec2(1.2);
      setCursor("pointer");
  });

    btn.onHoverEnd(() => {
        // btn.scale = vec2(1);
        btn.outline = { width: 2, color: rgb(...SNYK_COLOR_PURPLE) };
    });

    btn.onClick(startGame);

  })

  onKeyPress('space', () => {
    startGame();
  })
})

function startGame() {
  gameMusicIntro = play('game-nonplay', {loop: true, volume: 0.7})
  go('game');
}


go('credits-0')