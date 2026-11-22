/* Original relief-print illustrations for unpictured figures. All dates are supplied by the roster. */
(() => {
  'use strict';

  // Each block is cut from a silhouette: body, paper cut-outs, second ink, and fine linework.
  const blocks = {
    cat:['M16 91Q26 85 32 70Q39 54 52 50L51 28L65 39Q72 35 80 38L92 27L90 53Q95 69 85 79L92 87L85 94L67 93L63 85Q52 97 33 96Q9 98 9 83Q9 74 17 72Q21 73 19 77Q11 80 16 86Q19 88 25 87Z','M57 54L64 57L60 58ZM77 56L84 52L81 58Z','M63 63L69 65L74 62L69 69Z','M64 73L55 82M83 63L97 60M81 68L96 71M55 62L46 60'],
    rocket:['M52 76L50 54Q51 32 67 13Q77 32 76 52L72 76L81 89L70 85L65 90L58 84L46 91Z','M57 42Q64 35 70 42L69 49Q63 54 57 48Z','M56 89L61 108L65 98L68 104L69 88Z','M56 66L71 66M56 72L70 72M62 28L66 21'],
    ball:['M14 58C14 32 35 15 61 14C88 14 106 35 106 59C106 85 86 105 61 106C35 106 14 86 14 58Z','M23 54Q38 30 62 23Q39 27 27 43Z','M26 38Q76 53 74 101L79 99Q83 54 29 34ZM72 17Q60 38 96 79L99 74Q69 40 77 18Z','M39 36L35 45M47 41L43 49M56 46L51 54M64 54L58 59M72 64L66 68M80 84L72 85M68 27L77 29M70 37L79 36'],
    fish:['M11 59Q25 54 33 47Q49 31 70 34Q84 34 94 45L111 35L107 53L113 72L92 66Q87 79 65 84Q43 90 26 77Q16 70 11 64L18 62Z','M23 60Q35 46 49 43Q37 52 31 63Z','M48 42Q54 21 70 19L73 35ZM57 82L73 95L76 78ZM80 49A4 4 0 1 0 88 49A4 4 0 1 0 80 49Z','M36 66Q43 74 53 73M49 60L55 64L51 68M61 51L66 55L62 59'],
    shogi:['M23 91L29 36L60 17L91 36L97 91Q63 102 23 91Z','M31 86L35 41L60 25L85 41L90 86Z','M43 45L76 45L75 51L64 52L64 61L75 60L74 65L64 66L64 76L81 75L79 81L39 82L40 77L57 77L57 66L45 67L45 61L57 61L57 52L42 52Z','M31 89Q58 98 88 89'],
    pumpkin:['M10 65C8 48 19 36 33 38Q43 26 55 32Q63 25 70 33Q84 29 92 40Q110 43 108 64Q106 87 84 91Q75 98 63 94Q48 100 34 94Q13 90 10 65Z','M31 84Q21 61 33 43Q24 68 39 88ZM57 89Q48 62 58 39Q52 65 63 90ZM77 87Q90 58 80 40Q97 64 82 88Z','M53 35L56 15L69 13L64 25L66 35Z','M17 59L20 56M25 77L28 77M41 46L44 45M42 60L45 59M46 77L49 76M67 50L70 49M69 67L73 66M73 84L75 83M94 55L97 54M93 74L96 73'],
    book:['M12 29Q37 20 58 32L62 33Q85 20 107 25L107 85Q85 78 62 92L58 92Q39 81 12 86Z','M18 34Q38 28 55 37L55 79Q38 73 18 79ZM65 37Q82 28 101 30L101 77Q84 74 65 81Z','M54 26L66 23L66 54L61 49L57 56Z','M23 41Q36 37 49 41M24 48Q37 45 49 49M24 56Q38 53 49 56M72 46L94 39M72 54L94 48M72 62L91 57M61 39L60 85'],
    scroll:['M25 24Q24 18 33 17L91 17Q104 17 101 28L95 83Q98 89 94 98Q91 103 84 100L27 97Q14 98 15 87Q14 82 21 77Z','M33 25L88 25L81 83L26 84Z','M20 79L80 82Q75 90 82 95L27 92Q21 93 20 88Z','M39 38L75 38M38 46L66 46M37 56L74 55M37 64L63 63M86 22L95 22'],
    feather:['M19 102L41 70Q34 55 47 39Q61 20 104 11Q102 30 87 45L74 46L79 50L64 64L53 65L56 68L43 77L25 104Z','M43 70Q60 47 85 30Q58 54 48 72Z','M21 97L25 100L21 107L16 109Z','M63 45L64 33M71 38L74 27M53 57L51 45'],
    wave:['M8 82Q28 78 42 60Q56 42 66 34Q78 22 93 24Q107 25 106 36Q105 42 99 44Q100 35 92 36Q80 39 81 55Q83 74 111 78L106 95L11 95Z','M13 88Q40 83 53 64Q67 43 76 39Q67 50 63 65Q50 86 26 90ZM73 72Q88 88 107 85L105 89Q84 90 73 72Z','M82 30Q91 22 101 30L105 36L101 36L98 32L94 34L92 30L87 33Z','M27 93Q50 89 62 76'],
    ship:['M9 72L48 80L76 79L111 67L99 85Q88 96 58 99Q36 96 20 88Z','M32 84Q57 94 88 83Q62 99 32 84Z','M60 16L60 71L21 70Q45 55 60 16ZM65 22Q84 35 92 64L65 71Z','M61 16L62 80M27 73L42 64M70 29L84 64M59 22L79 18'],
    satellite:['M45 43L63 35L78 48L75 68L58 77L43 65Z M10 40L35 28L40 49L14 61ZM82 66L107 54L112 76L87 88Z','M49 48L61 42L72 50L60 57ZM18 44L31 38L32 42L19 47ZM90 72L104 66L105 69L91 76Z','M55 34Q69 19 88 22Q84 39 70 43ZM82 19L93 10L96 13L85 22Z','M35 46L48 54M73 60L89 71M23 36L27 53M94 62L101 81'],
    telescope:['M19 61L79 31L85 45L25 74ZM74 29L88 22L99 45L85 51ZM15 64L22 62L27 74L19 78ZM50 65L60 61L65 73L60 77L77 99L70 101L56 83L48 105L42 104L49 78L32 95L27 91Z','M27 63L72 40L73 43L30 65Z','M90 24L97 21L107 40L101 44Z','M80 32L87 46'],
    compass:['M60 11L67 20A39 39 0 1 1 51 20ZM59 16L56 21L63 21Z','M60 29A31 31 0 1 0 60 91A31 31 0 1 0 60 29Z','M44 77L54 54L77 41L66 67Z','M60 34L60 40M60 80L60 86M35 60L41 60M79 60L85 60M45 77L62 60L76 42'],
    mountain:['M6 94L34 45L44 59L64 15L108 94Z','M46 64L63 30L73 49L66 46L59 57L56 52ZM17 85L34 56L41 66L35 63L30 69L29 66Z','M61 45L69 53L64 63L77 72L71 80L87 92L79 94L62 78L68 71L57 63L63 53Z','M83 69L92 87M41 78L34 88'],
    tree:['M54 97L56 72Q38 74 36 66Q20 73 17 57Q8 48 19 40Q16 28 31 27Q33 14 48 20Q57 8 67 18Q81 13 86 26Q102 22 104 41Q114 50 103 59Q100 75 80 68L65 76L68 97L86 103L33 103Z','M57 69L49 52L36 46L48 48L43 35L54 48L58 59L62 33L66 35L65 56L81 41L84 43L65 63L63 72Z','M15 51Q19 40 31 42Q24 48 15 51ZM74 25Q75 17 83 22L86 27Z',''],
    flower:['M60 91L63 61L68 60L65 90Q78 73 90 76Q86 88 66 94L63 106L57 106L59 95Q43 96 35 81Q48 80 60 91Z','', 'M64 22C75 -1 90 15 83 30C105 24 111 43 89 48C103 61 89 76 76 62C69 83 49 76 52 59C31 69 19 53 38 43C18 32 30 15 48 26C46 10 59 6 64 22Z','M58 41Q66 34 74 42Q72 52 64 53Q57 50 58 41'],
    leaf:['M14 79Q27 19 104 14Q103 83 44 91Q28 95 21 88L11 102L6 99Z','M22 84Q55 56 92 28Q47 69 26 89Z','M40 74L48 47L48 66ZM57 61L66 35L65 55ZM51 74L76 72L59 80Z','M30 78L32 62M71 51L88 45'],
    flask:['M46 19L75 19L75 25L71 26L71 45L99 88Q107 102 91 103L29 103Q15 103 20 91L49 45L49 27L46 25Z','M55 28L65 28L65 47L78 68L41 67L55 46Z','M37 75Q49 69 61 75Q70 80 83 74L94 92Q97 98 90 98L32 98Q24 98 27 92Z','M45 81L41 87M75 91L81 91'],
    atom:['M17 80Q9 68 41 42Q76 13 97 21Q119 33 84 66Q44 104 19 89L16 84Q41 100 78 64Q106 37 97 29Q88 19 51 42Q20 62 17 80ZM22 25Q35 14 69 39Q110 70 102 88Q90 106 52 81Q16 58 16 41Q15 32 22 25ZM26 31Q10 44 55 75Q87 97 96 87Q105 76 66 47Q35 23 26 31Z','', 'M53 61A10 10 0 1 0 73 61A10 10 0 1 0 53 61ZM88 29A5 5 0 1 0 98 29A5 5 0 1 0 88 29Z',''],
    quillpot:['M25 63L55 63L56 70Q64 72 66 80L66 96Q64 104 53 104L27 104Q17 103 17 95L18 83Q19 73 25 71Z','M24 84L32 80L29 94L23 95Z','M43 65L50 49Q53 29 72 17Q85 10 103 11Q97 32 77 46L74 45L71 51L55 55L50 66Z','M54 55L87 24M24 70L55 70'],
    pen:['M14 95L49 43L62 53L27 104L10 111Z M50 40L59 24L73 34L64 50Z','M19 98L29 88L24 100L15 106Z','M60 24L72 9Q76 4 81 9L86 14Q90 17 84 22L74 34Z','M33 81L54 51'],
    brush:['M37 75L75 18Q80 11 86 16Q89 20 84 27L48 83Z','', 'M44 77Q31 70 25 82Q21 91 8 103Q28 102 38 96Q50 90 44 77Z','M48 72L56 77M53 67L61 72M56 63L64 68'],
    violin:['M57 47Q43 43 39 53Q33 63 42 67Q42 72 38 74Q24 72 18 86Q11 103 27 109Q44 115 53 98Q55 89 53 84Q57 77 62 79Q73 81 76 68Q79 58 67 55L90 26L84 19Z','M35 78L41 76L42 83L37 87L32 86L36 83ZM57 62L63 60L64 67L60 72L56 70Z','M84 22L88 12L95 9L102 14L96 24L90 28Z','M38 93L87 25M33 89L45 97'],
    keyboard:['M9 41L98 26L110 76L22 95Z','M17 46L95 33L103 72L27 86Z','M24 45L30 43L35 66L29 68ZM36 43L43 41L47 63L41 64ZM59 39L65 38L69 59L64 60ZM71 37L77 35L82 57L76 58ZM83 35L89 34L93 55L88 57Z','M31 67L35 83M44 64L49 81M54 42L63 78M68 60L72 76M81 59L84 74M91 56L95 73'],
    camera:['M11 38L35 38L41 26L68 26L75 37L98 37Q106 37 107 43L106 84Q106 90 99 90L17 91Q10 91 10 84Z','M42 65A17 17 0 1 0 76 65A17 17 0 1 0 42 65ZM18 45L33 44L33 50L18 50Z','M48 65A11 11 0 1 0 70 65A11 11 0 1 0 48 65Z','M55 60Q59 56 64 60M84 47L98 47'],
    film:['M10 31L106 23L110 85L14 94Z','M21 44L47 42L49 74L23 77ZM56 41L96 38L98 69L58 74Z','M29 50L41 59L30 69Z','M17 36L24 35M31 34L38 34M46 33L53 32M61 31L68 30M77 29L84 29M91 28L99 28M20 85L27 85M37 84L44 83M56 81L63 80M75 80L82 79M92 78L100 77'],
    lamp:['M37 91L48 85L49 68Q34 57 35 43L86 43Q83 59 68 68L68 84L82 89L87 98L34 98Z','M42 49L77 49Q71 58 58 61Q47 61 42 49Z','M52 40Q40 27 56 12Q56 24 65 26Q78 18 77 9Q91 30 72 40Z','M49 89L73 89'],
    sword:['M16 94L35 73L29 67L31 61L44 67L87 18L105 8L98 29L52 76L59 87L55 91L44 82L25 102Z','M48 69L94 22L52 74Z','M13 95L23 104L18 110L8 101Z','M29 92L35 97'],
    bow:['M19 25Q38 6 68 26Q94 46 99 78Q101 89 96 99L90 95Q92 71 74 47Q53 17 28 24Z','', 'M16 87L72 39L70 32L88 27L82 45L76 42L25 91L22 100L9 104Z','M24 25L95 96'],
    crown:['M12 38L34 53L38 26L56 47L72 15L80 43L103 25L97 76L25 90Z','M27 65L92 52L91 58L29 72Z','M28 78L93 65L94 72L29 85Z','M45 58L50 53L55 57L51 61ZM68 53L73 48L78 52L74 57Z'],
    helmet:['M24 88L28 70Q10 48 29 30Q45 16 68 26Q84 28 91 43L106 56L91 62L89 90L73 102L62 85L58 63L45 66L36 87Z','M47 52Q65 42 83 50L86 55L59 57Z','M24 45Q18 20 39 12Q66 1 86 24Q65 16 49 24Q29 31 24 45Z','M67 64L72 81M75 62L80 78'],
    shield:['M14 31L58 15L101 32L99 61Q91 87 58 108Q24 91 17 65Z','M22 36L58 23L92 36L89 61Q84 81 59 98Q32 83 25 63Z','M57 31L65 49L84 51L70 65L75 82L59 72L43 81L47 63L33 51L52 48Z',''],
    fan:['M57 102L8 54Q18 24 50 18Q82 10 110 43L62 101Z','M21 53L55 85L41 32Q29 38 21 53ZM46 29L59 82L64 26ZM69 27L64 83L88 33Z','M60 87L63 95L58 100L53 94Z','M15 54L33 41M87 46L103 44'],
    lantern:['M41 25Q56 4 74 22L77 30L82 33Q94 41 95 58Q97 80 80 88L76 95L47 95L43 89Q23 82 25 60Q24 42 40 33Z','M45 29L71 29Q66 13 55 18Q48 20 45 29ZM33 55Q36 41 49 38Q39 52 39 65L32 65Z','M44 35L78 35L77 40L43 40ZM45 85L78 85L76 90L47 90Z','M44 71Q61 76 80 69M35 59Q61 66 88 58M52 96L51 107M59 96L60 109M67 96L69 106'],
    teabowl:['M12 55Q19 42 62 43Q93 40 106 49Q105 77 85 86L80 98L47 101L40 92Q17 90 12 55Z','M19 54Q42 45 72 46Q92 46 100 51Q65 64 19 58Z','M29 68Q42 76 52 70Q48 84 39 85Z','M42 91Q57 95 84 87M54 36Q46 31 53 24M63 34Q58 27 68 19'],
    flute:['M10 76L94 27L106 42L18 92Z','M18 78L94 33L96 37L21 83Z','M87 32L93 28L104 41L99 44Z','M37 75L40 71M51 67L54 63M66 58L69 55M80 50L82 47'],
    scrollmap:['M13 35L41 23L69 34L99 22L106 83L76 98L46 87L18 100Z','M20 40L39 32L43 79L24 87ZM47 32L65 39L70 86L51 78ZM73 42L94 33L99 77L78 87Z','M30 62L50 50L68 66L90 48L94 52L69 74L50 58L33 68Z','M83 48L90 46L88 54'],
    wheel:['M60 14A45 45 0 1 0 60 104A45 45 0 1 0 60 14Z','M60 23A36 36 0 1 0 60 95A36 36 0 1 0 60 23Z','M53 60A8 8 0 1 0 69 60A8 8 0 1 0 53 60Z','M60 24L60 96M25 60L96 60M34 35L86 87M34 85L87 34'],
    pyramid:['M8 92L69 21L110 89L58 101Z','M18 88L62 37L54 93Z','M69 31L63 94L100 86Z','M25 85L51 57M74 72L90 78'],
    drum:['M23 39Q56 20 91 35L96 76Q59 96 27 83Z','M30 40Q57 27 83 36Q62 52 30 44Z','M25 49Q58 59 90 42L91 50Q61 66 26 56ZM29 78Q62 89 91 70L92 77Q61 96 28 84Z','M32 57L40 78L49 59L57 81L67 57L74 79L84 52'],
    microscope:['M26 94L35 85L60 85L60 78Q91 68 82 46L75 41L62 55L54 50L67 26L62 22L67 14L93 31L89 38L86 37Q107 53 98 74Q95 85 82 91L98 95L100 103L26 103Z','M72 30L79 34L72 44L66 40Z','M26 67L63 62L65 67L27 73ZM43 75L55 73L56 82L44 83Z','M39 97L85 97'],
    globe:['M57 12A36 36 0 1 0 57 84A36 36 0 1 0 57 12ZM75 89L80 100L91 103L90 107L50 107L49 103L63 99L61 91Z','M31 35L39 21L54 18L53 24L44 28L45 33L37 39ZM43 42L53 45L59 54L53 65L48 77L42 65ZM65 25L78 25L84 35L76 39L73 45L66 40L60 32Z','M94 27L100 23Q119 68 84 88Q65 100 41 92L43 86Q62 92 81 82Q106 66 94 27Z','M27 51Q60 62 88 46M42 19Q32 53 54 80'],
    hourglass:['M32 15L90 15L88 22L82 24Q81 43 66 54Q64 58 66 62Q83 76 83 92L89 95L91 101L29 101L31 94L38 92Q38 75 54 61Q58 56 53 52Q36 41 37 24L30 21Z','M44 24L75 24Q75 39 61 50Q46 43 44 24ZM45 91L76 91Q73 77 62 68Q49 79 45 91Z','M47 34L72 34Q67 44 60 48Q52 43 47 34ZM48 87L60 78L72 87Z',''],
    column:['M33 22L85 22L92 27L91 34L85 39L80 39L78 88L89 92L93 100L28 100L31 92L42 88L41 39Q32 41 29 35Q25 27 33 22Z','M46 42L50 42L50 86L46 86ZM56 42L61 42L60 86L56 86ZM68 42L73 42L72 86L68 86Z','M31 27L88 27L89 31L31 31Z','M34 94L86 94'],
    moon:['M81 15C50 18 35 48 50 72Q64 94 97 82Q80 109 52 102C14 94 9 51 33 28Q51 10 81 15Z','M28 63Q26 46 44 30Q25 54 35 76Z','M79 30L82 38L91 41L83 45L80 54L77 45L69 41L77 37Z',''],
    loom:['M23 24L32 22L32 90L86 83L85 16L94 14L99 98L89 100L87 91L32 99L31 106L22 108Z M32 32L87 24L88 30L32 39ZM32 82L87 74L88 80L33 88Z','', 'M37 47L81 42L82 65L38 71Z','M39 38L40 83M47 36L48 81M55 35L56 79M64 33L65 78M72 32L73 77M80 30L82 75M38 51L80 45M40 59L79 53M40 66L80 60'],
    tablet:['M24 19Q19 15 17 25L13 88Q13 98 23 101L87 100Q96 98 97 90L102 30Q100 22 91 20Z','M25 29L90 29L84 88L21 89Z','M31 39L45 39L34 46ZM51 39L63 39L52 46ZM68 39L83 39L70 47ZM31 54L44 54L33 62ZM50 55L68 54L52 62ZM31 70L45 70L32 77ZM51 70L67 70L52 78Z',''],
    wheelgear:['M52 13L64 13L67 23L76 25L84 19L94 27L90 38L96 45L107 43L111 56L101 62L101 71L109 78L101 90L90 86L81 91L80 102L66 105L62 94L53 93L46 101L35 94L39 82L31 75L21 78L16 65L25 58L25 51L16 45L21 31L33 32L40 25L39 17Z','M60 38A22 22 0 1 0 60 82A22 22 0 1 0 60 38Z','M52 60A9 9 0 1 0 70 60A9 9 0 1 0 52 60Z',''],
    radio:['M13 42L100 35L107 88L17 96Z','M20 49L70 45L74 81L24 86ZM78 48A7 7 0 1 0 92 48A7 7 0 1 0 78 48Z','M24 53L65 50L66 54L25 58ZM26 64L69 59L69 63L27 69ZM28 75L70 70L71 73L28 80Z','M28 39L78 12M81 69L96 68M81 75L95 74'],
    wing:['M12 64Q41 22 103 17L92 34L68 43L83 41L75 52L55 58L69 57L58 69L41 75L50 75L37 88L21 89Z','M23 70Q49 46 89 27Q58 46 27 78Z','M14 75L23 83L16 99L8 101Z',''],
    paperplane:['M9 53L107 18L83 98L57 78L40 96L42 70Z','M22 53L89 29L47 64ZM49 72L69 57L47 84Z','M54 70L98 30L80 88Z',''],
    torii:['M8 25Q24 35 61 31Q96 28 107 18L106 28Q98 39 62 41Q31 44 12 36ZM22 47L99 40L98 47L22 55Z M30 40L43 39L39 99L29 101ZM79 35L91 32L95 93L84 96Z','', 'M53 42L67 40L67 55L53 57Z','M26 62L95 54'],
    tokens:['M14 68Q18 57 40 60Q56 64 56 75L55 87Q49 99 27 94Q15 91 14 84Z M51 34Q57 17 82 20Q103 22 105 38L101 56Q95 67 72 64Q55 63 50 50Z','M19 70Q29 62 44 67Q48 68 50 72Q37 79 20 74ZM57 33Q72 21 95 31L98 37Q77 45 57 38Z','M53 72L59 63Q76 56 93 68L96 82L91 91Q73 100 57 92Z','M20 83Q33 91 50 83M60 49Q78 56 97 46M62 79Q76 88 92 79'],
    mask:['M18 35Q38 37 55 25L66 24Q82 32 103 27L98 64Q94 89 67 103Q38 94 23 72Z','M31 48Q41 41 53 51Q46 59 34 55ZM69 49Q79 37 92 43Q89 54 76 54ZM47 75Q62 80 82 69Q70 88 52 84Z','M58 57L65 51L72 66L60 68Z',''],
    arch:['M14 91L13 59Q14 15 54 12Q90 7 101 45L105 84L88 87L85 52Q81 31 61 31Q36 31 32 56L33 90Z','M22 46L34 43L40 32L30 34ZM53 19L54 29L65 29L69 19Z','M13 92L40 88L40 98L12 104ZM81 88L107 82L109 92L83 100Z','M20 69L31 67M90 58L101 56'],
    gramophone:['M77 17Q90 12 106 11L108 58Q94 61 78 54Q56 51 50 64L45 61Q47 42 65 31Z M13 81L67 69L93 81L88 97L38 108L12 97Z','M79 25Q90 19 100 19L102 49Q86 51 73 43Z','M28 82Q46 75 64 78Q78 84 61 90Q40 97 24 89Z','M45 64L45 81M18 94L40 102L83 93'],
    gridpaper:['M19 18L91 14L102 91L28 103Z','M27 26L84 22L94 84L34 95Z','M53 59Q61 52 68 60Q73 66 66 72Q59 77 54 71Q47 66 53 59Z','M41 31L48 88M56 29L63 85M72 26L79 84M31 43L85 36M32 56L87 50M33 70L89 63M35 84L91 76']
  };

  Object.assign(blocks,{
    bladepair:['M11 84L37 64L32 58L36 55L45 59L87 19L105 11L97 28L50 70L55 78L51 81L44 76L20 97Z M35 16L49 23L84 67L93 64L97 68L92 73L108 94L102 100L85 80L79 84L74 80L77 72L40 31Z','M53 63L94 24L57 66Z','M11 86L20 94L17 100L7 91Z',''],
    pipe:['M17 75L52 67L75 74L62 81L26 86Z M62 71Q59 37 80 27L91 31L98 48Q80 41 76 51Q70 62 74 76Z','M69 51Q70 34 82 31Q73 42 71 54Z','M22 69Q17 51 25 43Q24 55 31 58Q37 63 31 68Z',''],
    scales:['M55 20L62 15L68 22L65 28L94 33L93 38L65 34L66 84L84 92L85 99L40 99L40 92L57 85L58 33L28 41L26 36L57 27Z','', 'M14 66Q24 73 43 62Q42 80 28 81Q17 81 14 66ZM78 60Q90 68 106 59Q103 77 91 78Q79 76 78 60Z','M28 40L16 65M28 40L42 63M92 37L79 60M92 37L105 59'],
    bottle:['M49 17L70 16L72 29L70 34L71 42L83 51Q87 54 88 65L89 91Q87 102 72 105L43 102Q34 100 34 92L33 63Q33 53 47 46L50 41Z','M42 58L49 53L47 84L40 88Z','M39 68L83 62L84 82L40 89Z','M52 26L68 24M44 94L79 89'],
    chair:['M25 18Q50 12 70 22L72 55L87 51L94 59L85 67L89 91L83 95L75 70L47 76L49 100L42 103L36 77L24 73L21 59L28 57Z','M32 25Q48 21 63 26L66 51L35 57Z','M30 59L67 53L80 59L42 69L29 65Z',''],
    lightning:['M72 8L31 56L52 60L28 108L93 45L69 41L90 10Z','M49 53L69 31L61 48L77 51L52 77L60 58Z','M15 53L28 49L26 56ZM94 72L106 77L93 79Z',''],
    crane:['M13 83L45 56L45 20L64 42L95 18L82 51L105 59L84 65L64 81L53 102L49 81L30 92Z','M48 29L58 46L48 54ZM59 64L85 37L75 55Z','M27 78L46 61L52 66L39 76Z','M50 78L67 65M81 58L93 59'],
    hoof:['M18 83L36 62L43 34L53 31L52 17L62 27L73 18L73 30L93 45L98 61L90 69L77 64L67 52L62 70L75 88L68 96L51 80L41 91L31 96Z','M61 36L71 38L67 43Z','M45 33L49 21L50 42L46 57L37 68Z','M81 50L88 56'],
    niche:['M18 103L15 61Q15 26 58 12Q100 24 103 54L104 99Z','M30 89L27 60Q29 37 58 26Q88 38 91 60L92 88Z','M44 83L44 63Q46 51 59 45Q77 52 78 63L79 82Z','M23 95L96 92'],
    lens:['M16 56Q59 5 104 54Q63 111 16 56Z','M27 55Q60 23 93 53Q61 92 27 55Z','M45 55A17 17 0 1 0 79 55A17 17 0 1 0 45 55Z','M55 52Q59 46 65 49'],
    windmill:['M54 63L65 63L77 101L46 102Z M58 54L26 25L20 34L51 59ZM64 52L95 22L86 16L58 48ZM68 60L94 82L100 75L73 54ZM54 63L29 89L36 96L63 67Z','M55 91L62 79L67 93Z','M54 56A7 7 0 1 0 68 56A7 7 0 1 0 54 56Z',''],
    bridge:['M9 75L18 73Q38 44 53 30L60 29Q76 43 98 64L110 61L111 68L13 84ZM24 82L31 81L29 99L23 100ZM88 71L96 69L99 87L92 91Z','', 'M51 25L62 23L65 82L56 85Z','M22 71L51 35L48 65M66 36L96 64M34 58L35 69M81 53L83 67'],
    bell:['M23 81Q33 70 34 51Q32 32 50 24Q50 14 59 13Q69 12 71 21Q86 24 88 45Q87 64 101 72L102 78L25 88Z','M44 52Q43 37 53 33L48 54Z','M52 89L75 87Q73 100 63 101Q53 101 52 89Z','M31 77L91 68'],
    boltgate:['M14 100L18 64L58 45L96 54L105 91L52 104Z','M27 65L55 55L54 93L28 92ZM67 56L86 61L91 84L68 89Z','M40 28L54 11L50 33L63 30L46 52L49 35Z',''],
    medal:['M25 18L45 17L59 47L72 16L92 15L73 57L50 64Z M62 51A26 26 0 1 0 62 103A26 26 0 1 0 62 51Z','M62 58A19 19 0 1 0 62 96A19 19 0 1 0 62 58Z','M62 63L66 72L76 74L69 81L70 91L61 86L53 91L54 81L47 75L57 73Z',''],
    ring:['M23 47Q55 25 98 37L98 51Q59 67 24 57Z M29 58L35 74L47 69L53 83L68 70L76 74L91 53L98 53L80 84L65 95L48 96L35 83L24 59Z','M29 49Q58 36 91 41Q65 51 32 51Z','M72 17A11 11 0 1 0 94 17A11 11 0 1 0 72 17Z','M76 12Q88 20 91 24'],
    stone:['M18 86Q12 74 25 61L35 31L56 18L78 20L101 54L104 84L76 98L36 98Z','M28 76L45 34L55 29L48 60L31 87Z','M64 29L76 30L92 58L82 67L67 47Z','M48 82L61 60L70 65L64 80'],
    beacon:['M41 102L51 51L50 40L44 39L44 33L59 18L75 29L77 35L71 38L71 52L84 96Z','M54 37L66 34L66 47L54 48Z','M50 68L74 58L77 69L47 81Z','M38 32L16 26M36 42L12 46M80 32L106 22M82 41L109 43']
  });

  const palettes = [
    ['#f5e6c1','#253c50','#b54430'],['#cbdccd','#253f3f','#c85b36'],
    ['#f4dbb0','#483142','#aa463b'],['#cfdee0','#244351','#bf5039'],
    ['#eadfc8','#363c4e','#6c817e'],['#f0ccac','#463544','#a44738'],
    ['#e8d7b3','#394c41','#b85a32'],['#dfd7e2','#3d354d','#a64057'],
    ['#eddeb5','#35444b','#a56b22'],['#bcd4d6','#24454b','#ac493d'],
    ['#ead5c3','#4d393b','#9e5242'],['#e3ddbf','#374946','#a35b46']
  ];

  const named = new Map();
  // name / print title / main block / companion block / backdrop. The title is
  // an original visual interpretation; the roster article remains its biography source.
  const entries = `
夏目漱石|猫と原稿用紙|cat|gridpaper|print
イーロン・マスク|帰還するロケット|rocket|wheelgear|sky
大谷翔平|二刀流の白球|ball|wing|sport
黒柳徹子|対話を待つ椅子|chair|radio|stage
さかなクン|海をのぞく魚類図|fish|lens|water
藤井聡太|盤上の王将|shogi|gridpaper|grid
草間彌生|水玉の南瓜|pumpkin|lens|dots
山中伸弥|細胞の培養皿|microscope|flask|cells
川口淳一郎|はやぶさの翼|satellite|stone|sky
向井千秋|軌道を泳ぐメダカ|fish|satellite|orbit
若田光一|宇宙実験棟の軌道|satellite|globe|orbit
山崎直子|宇宙への補給便|rocket|satellite|orbit
羽生結弦|着氷の弧|wing|medal|sport
吉田沙保里|マットの金メダル|medal|ring|sport
上野由岐子|マウンドの黄球|ball|medal|sport
小澤征爾|指揮台の総譜|keyboard|violin|staff
坂本龍一|雨と鍵盤|keyboard|wave|water
三宅一生|ひだを刻む一枚布|loom|fan|fold
安藤忠雄|光の十字の建築図|arch|gridpaper|blueprint
宮崎駿|飛行機の絵コンテ|paperplane|film|sky
鳥山明|七つの星の漫画原稿|pen|gridpaper|stars
上橋菜穂子|槍使いの物語|scroll|sword|hill
角野栄子|旅立つ魔女の本|book|moon|sky
黒澤明|七人を映すフィルム|film|sword|rain
中村哲|砂漠を潤す用水路|wave|mountain|contour
田部井淳子|ヒマラヤの稜線|mountain|compass|contour
ジェーン・グドール|ゴンベの観察帳|tree|book|field
シルビア・アール|海底探査の観測窓|lens|fish|water
メイ・ジェミソン|軌道上の実験|flask|satellite|orbit
マーガレット・ハミルトン|月へのコードの束|book|moon|blueprint
ジョスリン・ベル・バーネル|パルサーの記録紙|gridpaper|radio|signal
ティム・バーナーズ＝リー|ウェブの結節点|globe|gridpaper|network
リーナス・トーバルズ|公開されたソースコード|gridpaper|wheelgear|network
ヴィントン・サーフ|ネットワークの結線図|radio|globe|network
キップ・ソーン|時空の波紋|wave|atom|orbit
ヴェラ・ルービン|銀河の回転曲線|telescope|globe|orbit
屠呦呦|青蒿の葉と試料|leaf|flask|cells
エレン・オチョア|軌道上の光学レンズ|lens|satellite|orbit
ユスラ・マルディニ|海を渡る水しぶき|wave|ship|water
エリウド・キプチョゲ|二時間を刻むコース|hourglass|wing|sport
ウサイン・ボルト|九秒五八の稲妻|lightning|medal|sport
セリーナ・ウィリアムズ|サービスエースの軌道|ball|medal|sport
ナディア・コマネチ|十点満点の着地|medal|wing|sport
ヨーヨー・マ|シルクロードの弦|violin|scrollmap|staff
ザハ・ハディド|曲面の建築模型|arch|wave|blueprint
マヤ・リン|地面を切る追悼の壁|stone|gridpaper|contour
デイヴィッド・アッテンボロー|野生をとらえるレンズ|camera|leaf|field
セバスチャン・サルガド|モノクロのネガ|film|camera|print
イリヤ・カバコフ|部屋から宇宙へ|chair|rocket|sky
エル・アナツイ|瓶のふたを編む布|loom|bottle|fold
ウィリアム・カムクワンバ|自転車部品の風車|windmill|wheel|field
マララ・ユスフザイ|ひらかれた教科書|book|pen|print
マリアム・ミルザハニ|曲面に走る測地線|gridpaper|globe|contour
ジョージ・タケイ|宇宙船の操舵卓|radio|planet|orbit
ジェームズ・ダイソン|サイクロンの気流|wheelgear|wave|blueprint
サマンサ・クリストフォレッティ|宇宙のコーヒーカップ|teabowl|satellite|orbit
ガートルード・ベル|砂漠の測量帳|scrollmap|compass|contour
インドラ|雷霆の天|lightning|wheel|storm
天照大御神|岩戸から差す光|niche|lens|sun
須佐之男命|八岐大蛇の剣|sword|wave|storm
スサノオ|八岐大蛇の剣|sword|wave|storm
大国主命|白兎を癒やす蒲|leaf|flower|field
天宇受売命|岩戸前の舞台|drum|torii|stage
木花咲耶姫|花と火の産屋|flower|niche|sun
建御雷神|雷と剣|sword|lightning|storm
アテナ|アテナの盾|shield|helmet|sun
アテーナー|アテナの盾|shield|helmet|sun
ゼウス|雲を裂く雷|lightning|crown|storm
アヌビス|心臓を量る秤|scales|pyramid|sun
セクメト|獅子を照らす太陽|lens|pyramid|sun
ギルガメシュ|ウルクの粘土板|tablet|arch|ruin
アルジュナ|ガーンディーヴァの弓|bow|wheel|sun
ラーマ|森を越える弓|bow|tree|field
孫悟空|雲を割る如意棒|flute|cloud|sky
孫悟空（斉天大聖）|雲を割る如意棒|flute|cloud|sky
沙悟浄|流沙河の波|wave|stone|water
鉄扇公主|炎を押し戻す扇|fan|lamp|storm
女媧|天を補う五色の石|stone|moon|stars
嫦娥|月へ昇る影|moon|wing|sky
神農|薬草の本草図|leaf|bottle|field
紫式部|源氏の巻物|scroll|quillpot|fold
清少納言|枕草子の折帖|book|fan|fold
太宰治|斜陽の原稿|pen|book|sun
宮沢賢治|銀河をわたる鉄道|wheel|stars|stars
芥川龍之介|羅生門の雨|arch|scroll|rain
松尾芭蕉|奥の細道の旅笠|scrollmap|moon|hill
樋口一葉|たけくらべの稿本|quillpot|flower|print
与謝野晶子|みだれ髪の詩集|book|flower|fold
井原西鶴|浮世草子の版木|book|tablet|print
菅原道真|飛梅の枝|flower|scroll|field
小野小町|花の色の和歌|flower|scroll|rain
在原業平|八つ橋の杜若|bridge|flower|water
百人一首|歌札の重なり|tablet|scroll|print
平清盛|海に浮かぶ鳥居|torii|ship|water
宮本武蔵|二天一流の二刀|bladepair|scroll|rain
巴御前|弓を負う騎馬|hoof|bow|hill
徳川家康|天下を分けた陣|helmet|fan|field
織田信長|安土の城郭|arch|fan|ruin
豊臣秀吉|黄金の茶の湯|teabowl|fan|sun
上杉謙信|川中島の陣|helmet|bladepair|storm
武田信玄|風林火山の軍配|fan|mountain|hill
毛利元就|三本の矢|bow|scroll|field
明智光秀|本能寺の炎|torii|lamp|storm
坂本龍馬|海援隊の帆|ship|scrollmap|water
土方歳三|箱館の星形陣|sword|scrollmap|contour
聖徳太子|十七条の文|scroll|niche|fold
鑑真|海を渡る戒壇|ship|niche|water
空海|三筆の墨|brush|niche|fold
最澄|比叡山の灯|lamp|mountain|hill
葛飾北斎|大波の版木|wave|mountain|water
葛飾応為|夜の格子の灯|lantern|gridpaper|stage
歌川広重|東海道の雨|bridge|scrollmap|rain
伊藤若冲|草花の細密画|brush|flower|field
千利休|茶室の一碗|teabowl|niche|fold
伊能忠敬|列島の測量|compass|scrollmap|contour
平賀源内|エレキテルの稲妻|lightning|wheelgear|blueprint
杉田玄白|解体新書の図版|book|lens|print
新美南吉|ごんぎつねの原稿|feather|book|field
森鷗外|軍医と小説の二冊|book|bottle|print
井上靖|敦煌の巻物|scroll|stone|ruin
イブン・バットゥータ|海陸の旅行記|scrollmap|ship|contour
アルキメデス|円と浮力の作図|wheel|wave|blueprint
アキレウス|青銅の盾|shield|helmet|ruin
アタランテ|狩人の弓|bow|leaf|field
ブーディカ|二輪戦車の車輪|wheel|sword|hill
ハトシェプスト|段丘の葬祭殿|arch|pyramid|ruin
ジャンヌ・ダルク|オルレアンの軍旗|shield|flower|sun
レオナルド・ダ・ヴィンチ|飛翔の手稿|wing|gridpaper|blueprint
ガリレオ・ガリレイ|木星の四つの衛星|telescope|globe|orbit
アイザック・ニュートン|光を分けるプリズム|stone|lens|signal
チャールズ・ダーウィン|ビーグル号と群島|ship|leaf|contour
マリー・キュリー|放射線の記録|flask|atom|cells
アルベルト・アインシュタイン|時空の格子|gridpaper|hourglass|orbit
ニコラ・テスラ|高周波の放電|lightning|wheelgear|signal
アラン・チューリング|計算する紙テープ|scroll|wheelgear|network
エイダ・ラブレス|解析機関の歯車|wheelgear|gridpaper|blueprint
ヨハネス・グーテンベルク|組み上げた活字|tablet|book|print
フローレンス・ナイチンゲール|病棟を照らす灯|lamp|gridpaper|cells
ヴォルフガング・アマデウス・モーツァルト|魔笛の譜面|flute|keyboard|staff
ルートヴィヒ・ヴァン・ベートーヴェン|第九の総譜|keyboard|scroll|staff
ヨハン・ゼバスティアン・バッハ|対位法の譜線|keyboard|violin|staff
フレデリック・ショパン|夜想曲の鍵盤|keyboard|moon|staff
フィンセント・ファン・ゴッホ|星月夜の渦|moon|tree|stars
クロード・モネ|睡蓮の水面|flower|wave|water
ジュール・ヴェルヌ|海底の観測窓|lens|fish|water
エドガー・アラン・ポー|大鴉の羽根|feather|moon|stage
ヘレン・ケラー|指先で読む点字|tablet|book|dots
ルイ・ブライユ|六点の文字|tablet|book|dots
アメリア・イアハート|大西洋を渡る翼|wing|compass|sky
マルコ・ポーロ|東方の旅程図|scrollmap|compass|contour
トーマス・エジソン|音を刻む蓄音機|gramophone|wheelgear|signal
エドモン・ダンテス|イフ城から海へ|arch|wave|water
バラク・オバマ|演壇の声|radio|column|stage
フランシスコ・ザビエル|日本へ向かう帆|ship|scroll|water
フリーダ・カーロ|色彩の自画像|brush|flower|field
ヴィンセント・ヴァン・ゴッホ|星月夜の渦|moon|tree|stars
`.trim();
  for (const line of entries.split('\n')) {
    const [name,title,main,companion,backdrop] = line.split('|');
    named.set(name,{title,main,companion,backdrop});
  }

  Object.assign(blocks,{
    cloud:['M9 74Q5 58 23 52Q24 36 38 35Q47 15 67 27Q79 20 90 35Q106 37 106 55Q118 72 98 82L27 91Q15 91 9 82Z','M19 68Q21 59 31 58Q31 46 43 43Q35 53 36 63Q27 62 19 68Z','M30 78Q63 83 91 70Q69 88 37 87Z',''],
    stars:['M36 15L42 33L59 38L43 45L37 65L30 47L12 43L29 34Z M79 58L83 70L97 75L84 81L80 97L74 82L60 79L73 72Z','', 'M84 18L87 25L96 27L88 32L85 41L81 33L72 30L80 25Z',''],
    planet:['M62 23A33 33 0 1 0 62 89A33 33 0 1 0 62 23Z','M35 54Q35 34 57 29Q45 36 42 55Z','M13 74Q17 64 35 54L33 60Q15 76 29 74Q53 70 78 54Q108 38 103 36L92 36L92 32Q110 25 111 35Q108 48 75 66Q29 92 14 85Q9 82 13 74Z',''],
    staff:['M17 87L88 19L98 29L28 99Z','M28 88L84 35L86 37L30 92Z','M10 93L22 80L35 93L23 106ZM83 23L95 10L109 24L97 35Z',''],
    train:['M17 76L25 66L27 46L50 43L54 61L67 60L67 39L80 37L78 60L89 59L97 68L108 70L108 78L14 91Z','M33 49L45 48L47 60L32 63Z','M27 82A9 9 0 1 0 45 82A9 9 0 1 0 27 82ZM65 76A10 10 0 1 0 85 76A10 10 0 1 0 65 76Z','M71 31Q66 25 75 20M78 19Q87 13 90 18'],
    broom:['M19 86L41 63L48 61L89 17L96 22L54 68L51 79L32 100L12 107Z','M21 99L42 74L28 97ZM36 94L47 76L45 85Z','M40 66L48 59L57 68L50 75Z','']
  });
  named.get('孫悟空').main='staff';
  named.get('孫悟空（斉天大聖）').main='staff';
  named.get('宮沢賢治').main='train';
  named.get('角野栄子').companion='broom';

  Object.assign(blocks,{
    manuscript:['M15 26L94 18L104 91L23 102Z','M23 31L88 24L97 86L29 95Z','M25 34L85 28L85 31L26 38Z','M31 42L36 88M39 41L44 87M47 40L52 86M55 39L60 85M63 38L68 84M71 37L76 82M79 36L84 81M28 45L86 39M30 54L87 48M31 63L89 57M32 72L90 66M33 81L91 75M34 89L93 83'],
    boxfish:['M14 63L25 58L36 39Q51 29 72 33L86 42L94 53L108 44L112 49L108 71L94 65L85 78L60 86L33 81L23 72L13 69Z','M24 63L37 47L49 41L34 65L23 68Z','M54 34L68 23L72 33ZM51 81L69 82L70 88L65 91Z M42 55A3 3 0 1 0 48 55A3 3 0 1 0 42 55ZM56 44A3 3 0 1 0 62 44A3 3 0 1 0 56 44ZM66 57A3 3 0 1 0 72 57A3 3 0 1 0 66 57ZM50 68A3 3 0 1 0 56 68A3 3 0 1 0 50 68ZM76 70A3 3 0 1 0 82 70A3 3 0 1 0 76 70Z','M34 68L41 73M80 47L82 50'],
    dotpod:['M27 62A13 13 0 1 0 53 62A13 13 0 1 0 27 62ZM60 49A8 8 0 1 0 76 49A8 8 0 1 0 60 49ZM54 76A5 5 0 1 0 64 76A5 5 0 1 0 54 76Z','','M68 69A16 16 0 1 0 100 69A16 16 0 1 0 68 69ZM44 37A6 6 0 1 0 56 37A6 6 0 1 0 44 37Z','']
  });
  named.get('夏目漱石').companion='manuscript';
  named.get('さかなクン').main='boxfish';
  named.get('さかなクン').companion='book';
  named.get('草間彌生').companion='dotpod';
  for(const l of `
J・M・クッツェー|『マイケル・K』の種子|leaf|book|field
カズオ・イシグロ|『日の名残り』の家路|scrollmap|hourglass|hill
アーネスト・ヘミングウェイ|『老人と海』の釣り舟|ship|fish|water
ヘルマン・ヘッセ|『シッダールタ』の渡し舟|ship|tree|water
ガブリエル・ガルシア＝マルケス|マコンドの年代記|hourglass|book|rain
川端康成|雪国の車窓|train|mountain|hill
大江健三郎|森を書き継ぐ原稿|tree|manuscript|field
ボブ・ディラン|歌詞とハーモニカ|flute|manuscript|staff
ハロルド・ピンター|劇場の間|chair|mask|stage
サミュエル・ベケット|ゴドーを待つ木|tree|chair|stage
アルベール・カミュ|シーシュポスの岩|stone|mountain|hill
トーマス・マン|魔の山の窓|mountain|arch|hill
ウィリアム・ゴールディング|孤島の『蠅の王』|wave|tree|water
パール・S・バック|『大地』の畑|leaf|book|field
パブロ・ネルーダ|海を詠む詩集|wave|feather|water
ラビンドラナート・タゴール|ギタンジャリの詩帖|scroll|flower|fold
アレクサンダー・フレミング|青かびの培養皿|microscope|leaf|cells
ルイ・パスツール|白鳥の首のフラスコ|flask|wing|cells
ジェームズ・ワトソン|二重らせんの模型|atom|gridpaper|cells
フランシス・クリック|二重らせんを読む図|gridpaper|atom|cells
ニールス・ボーア|原子の軌道図|atom|planet|orbit
ヴィルヘルム・レントゲン|エックス線の透過像|film|lens|signal
アレクサンダー・グラハム・ベル|声を運ぶ回路|radio|lightning|network
ガリレイ|木星の四衛星|telescope|planet|orbit
マハトマ・ガンディー|塩の行進と海岸|wave|staff|contour
ネルソン・マンデラ|投票用紙の一票|tablet|pen|print
ワンガリ・マータイ|植えた木の年輪|tree|leaf|field
テオドール・ルーズベルト|国立公園の風景図|tree|mountain|hill
セオドア・ルーズベルト|国立公園の風景図|tree|mountain|hill
手塚治虫|連載漫画のペン先|pen|film|print
大友克洋|都市を描く漫画原稿|arch|pen|blueprint
マララ・ユスフザイ|少女に開く教室の本|book|pen|print
`.trim().split('\n')){
    const [name,title,main,companion,backdrop]=l.split('|');named.set(name,{title,main,companion,backdrop});
  }
  const signatureColors={
    '草間彌生':['#f2d46b','#302c2a','#a23b2f'],'さかなクン':['#c1dfe2','#283f58','#dba323'],
    '葛飾北斎':['#ece3c9','#234e69','#5b898d'],'葛飾応為':['#dfcea8','#2b3748','#af5039'],
    '夏目漱石':['#e7dbc2','#34333a','#98654f'],'イーロン・マスク':['#c6d7dd','#233e54','#bc5534'],
    '宮沢賢治':['#c7d1df','#343956','#997347'],'藤井聡太':['#ead4a1','#49382e','#805137']
  };
  const plateColors=(info)=>signatureColors[info.name]||palettes[info.seed%palettes.length];

  const subjects={
    writer:[['活字の版面','tablet','pen','print'],['詩の折帖','scroll','feather','fold'],['行間の版画','quillpot','book','print'],['綴じた原稿','book','gridpaper','fold'],['余白の筆','brush','scroll','rain']],
    artist:[['舞台の光','mask','lamp','stage'],['色刷の版面','brush','tablet','print'],['創作の素描','pen','gridpaper','blueprint'],['調べの線','violin','scroll','staff'],['映像の窓','film','lens','stage']],
    thinker:[['思索の折帖','book','lens','fold'],['対話の広場','column','scroll','ruin'],['問いの天秤','scales','tablet','grid'],['推論の作図','compass','gridpaper','blueprint'],['読み書きの灯','lamp','book','print']],
    scientist:[['観測の焦点','lens','gridpaper','orbit'],['実験の記録','flask','book','cells'],['計測と波形','atom','gridpaper','signal'],['自然観察の図版','leaf','microscope','field'],['幾何学の模型','globe','gridpaper','contour']],
    leader:[['印璽と文書','tablet','scroll','fold'],['議場の柱','column','scales','ruin'],['版図の折図','scrollmap','compass','contour'],['合議の椅子','chair','book','stage'],['街の門','arch','scroll','ruin']],
    warrior:[['防具の輪郭','helmet','shield','hill'],['盾の印刷紋','shield','sword','fold'],['進路の矢','bow','scrollmap','field'],['戦場の馬影','hoof','helmet','hill'],['号令の太鼓','drum','fan','storm']],
    explorer:[['航程の磁針','compass','ship','water'],['峠を越す地図','scrollmap','mountain','contour'],['風を読む帆','ship','globe','water'],['地平の観測','telescope','compass','sky'],['旅の野帳','book','tree','hill']],
    healer:[['薬草の標本図','leaf','bottle','field'],['治療の記録','book','bottle','print'],['観察する眼','microscope','leaf','cells'],['薬液の量目','flask','scales','cells'],['手当ての灯','lamp','book','stage']],
    deity:[['天空の光輪','lens','stars','sun'],['稲妻の神域','lightning','cloud','storm'],['天体のしるし','moon','stars','sky'],['祭祀の灯','lamp','niche','ruin'],['神話を織る糸','loom','wheel','fold']],
    inventor:[['機構の歯車','wheelgear','gridpaper','blueprint'],['回路の設計図','radio','boltgate','network'],['運動の試作機','wheel','wheelgear','blueprint'],['測定の光学台','lens','gridpaper','signal'],['工作の雛形','arch','compass','blueprint']]
  };
  // A profession-specific drawing is picked only when the source describes that field.
  const cues=[
    [/作曲|管弦楽|楽曲|音楽|演奏|交響|ピアニスト|歌手|ジャズ|歌劇/,['楽譜の版面','keyboard','violin','staff']],
    [/写真家|映像|映画|撮影|映画監督|シネマ/,['レンズと映写の窓','camera','film','stage']],
    [/画家|銅版|油彩|絵画|美術|浮世絵|水墨|版画|漫画/,['描線の版木','brush','tablet','print']],
    [/天文学|天体|天文台|観測|宇宙飛行|惑星|銀河/,['夜空の観測図','telescope','planet','orbit']],
    [/医学|免疫|細菌|遺伝|生理学|生物|微生物|生化学|細胞/,['生命の観察図','microscope','flask','cells']],
    [/素粒子|物理学|重力|量子|電子|光学/,['物理の観測記録','atom','lens','signal']],
    [/化学|触媒|化合物/,['物質の実験図','flask','atom','cells']],
    [/数学|幾何|統計/,['数理の作図','gridpaper','compass','blueprint']],
    [/平和賞|外交|平和運動|人道|人権/,['対話の記録','scales','scroll','print']],
    [/経済学|経済|統計|財政/,['数量の記録','gridpaper','tokens','grid']],
    [/建築|建造|設計|土木/,['構造の断面図','arch','gridpaper','blueprint']],
    [/宇宙船|航海|艦隊|船長|海軍|探検/,['航程の羅針','compass','ship','water']],
    [/馬術|騎馬|騎士|騎兵/,['騎馬の輪郭','hoof','shield','hill']],
    [/ボール|野球|テニス|五輪|マラソン|陸上|競技|体育|スポーツ/,['競技の軌跡','medal','wing','sport']],
    [/寺院|僧侶|修道|宗教|布教|禅師|仏教/,['祈りの文書','niche','scroll','ruin']],
    [/和歌|歌人|俳句|短歌/,['歌をのせた短冊','scroll','flower','fold']],
    [/植物|昆虫|博物|園芸/,['自然観察の標本図','leaf','lens','field']],
    [/王妃|女王|天皇|国王|皇帝|王位|即位/,['王権の刻印','crown','scroll','ruin']],
    [/彫刻|彫塑|石像/,['石と彫りの素描','stone','gridpaper','print']],
    [/文学|小説|文学賞|詩人|文芸|作家/,['言葉の校正刷','book','quillpot','print']]
  ];
  function hash(str){
    let n=2166136261;
    for(const c of str){n^=c.codePointAt(0);n=Math.imul(n,16777619);}
    return n>>>0;
  }
  function random(seed){
    return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  }
  const normal=s=>String(s||'').normalize('NFKC').replace(/[\s・＝=‐-]/g,'');
  const namedAliases=new Map([...named].map(([key,info])=>[normal(key),info]));
  const pathCache=new Map();
  function paths(key){
    if(!pathCache.has(key))pathCache.set(key,blocks[key].map(p=>p?new Path2D(p):null));
    return pathCache.get(key);
  }
  function concept(record){
    const name=String(record?.name||record?.id||'');
    const seed=hash([name,record?.year??'',record?.role||record?.roleCode||''].join('/'));
    const exact=named.get(name)||namedAliases.get(normal(name));
    if(exact)return {...exact,name,seed,personal:true};
    const role=record?.roleCode||record?.role||'thinker';
    const field=String(record?.roleLabel||'')+' '+String(record?.yearBasis||'');
    const relevant=cues.find(([rx])=>rx.test(field));
    const options=subjects[role]||subjects.thinker;
    const variant=options[seed%options.length];
    const [title,main,companion,backdrop]=relevant?relevant[1]:variant;
    return {name,seed,title,main,companion,backdrop,personal:false};
  }

  const TAU=Math.PI*2;
  function curve(ctx,draw,color,width=1){
    ctx.beginPath();draw(ctx);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
  }
  function line(ctx,x,y,u,v,color,width=1){
    curve(ctx,p=>{p.moveTo(x,y);p.lineTo(u,v);},color,width);
  }
  function disc(ctx,x,y,r,color){
    ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fillStyle=color;ctx.fill();
  }
  function ellipse(ctx,x,y,a,b,stroke,width=1,rotation=0){
    curve(ctx,p=>p.ellipse(x,y,a,b,rotation,0,TAU),stroke,width);
  }
  function hill(ctx,start,color,rng,amplitude){
    let y=start;
    ctx.beginPath();ctx.moveTo(-10,245);ctx.lineTo(-10,start);
    for(let x=-5;x<=252;x+=8){y+=(rng()-.52)*amplitude;y=Math.max(start-24,Math.min(start+19,y));ctx.lineTo(x,y);}
    ctx.lineTo(252,245);ctx.closePath();ctx.fillStyle=color;ctx.fill();
  }
  function ray(ctx,cx,cy,length,count,ink,rng){
    for(let i=0;i<count;i++){
      const a=i*TAU/count, inner=length*(.22+rng()*.13);
      line(ctx,cx+Math.cos(a)*inner,cy+Math.sin(a)*inner,cx+Math.cos(a)*length,cy+Math.sin(a)*length,ink,i%3===0?1.1:.55);
    }
  }
  function background(ctx,type,palette,rng,focus){
    const [paper,ink,spot]=palette;
    ctx.save();
    ctx.globalAlpha=.18;
    if(['sky','stars','orbit','storm'].includes(type)){
      const sx=42+rng()*118,sy=45+rng()*59;
      for(let i=0;i<45;i++){
        const x=12+rng()*216,y=19+rng()*160,r=rng()*1.6+.25;
        disc(ctx,x,y,r,i%4?ink:spot);
        if(i%8===0){line(ctx,x-3,y,x+3,y,ink,.7);line(ctx,x,y-3,x,y+3,ink,.7);}
      }
      for(let j=0;j<(type==='orbit'?5:2);j++)ellipse(ctx,sx+51,sy+65,66+j*17,22+j*4,ink,.75,-.45);
    }else if(['water','rain','signal','staff'].includes(type)){
      const b=75+rng()*84;
      for(let j=0;j<(type==='staff'?10:22);j++){
        const y=type==='staff'?b-55+(j%5)*5+Math.floor(j/5)*34:b+j*4-31;
        if(type==='rain'){line(ctx,j*15-38,19,j*15-86,152,ink,.7);continue;}
        curve(ctx,p=>{for(let x=-10;x<=252;x+=4){
          const wave=type==='staff'?x*-.06:type==='signal'?Math.sin(x*.20)*Math.exp(-((x-114)**2)/800)*11:Math.sin(x*.036+j*.12)*4;
          if(x===-10)p.moveTo(x,y+wave);else p.lineTo(x,y+wave);
        }},j%5===0?spot:ink,j%5===0?.95:.55);
      }
    }else if(['grid','blueprint','network','cells','sport'].includes(type)){
      const shift=rng()*10;
      if(type==='cells'){
        for(let i=0;i<31;i++){const px=rng()*240,py=37+rng()*158,r=3+rng()*12;ellipse(ctx,px,py,r,r*.77,ink,.65,rng());if(i%3===0)disc(ctx,px+1,py,r*.24,spot);}
      }else if(type==='sport'){
        for(let i=0;i<8;i++)ellipse(ctx,94,166,86+i*6,36+i*7,ink,.85,-.27);
      }else{
        for(let i=0;i<20;i++){const n=i*15+shift;line(ctx,n,20,n,203,ink,.45);line(ctx,8,n,231,n,ink,.45);}
        if(type==='network')for(let i=0,x=23,y=120;i<12;i++){
          const nx=22+rng()*192,ny=35+rng()*145;line(ctx,x,y,nx,ny,ink,1.1);disc(ctx,nx,ny,2.7,spot);x=nx;y=ny;
        }
      }
    }else if(['field','hill','waterline','contour','ruin'].includes(type)){
      if(type==='contour'){
        const x=40+rng()*125,y=75+rng()*60;
        for(let k=1;k<=21;k++)curve(ctx,p=>{
          for(let j=0;j<=72;j++){const a=j*TAU/72,r=6+k*5+Math.sin(a*3+k*.11)*5+Math.cos(a*5)*3;
            const u=x+Math.cos(a)*r*1.3,v=y+Math.sin(a)*r*.66;
            if(j===0)p.moveTo(u,v);else p.lineTo(u,v);}
        },ink,.6);
      }else{
        hill(ctx,151,spot,rng,12);ctx.globalAlpha=.14;hill(ctx,173,ink,rng,17);
        for(let j=0;j<11;j++){const x=rng()*230;line(ctx,x,151+rng()*24,x+16+rng()*35,144+rng()*15,ink,.6);}
      }
    }else if(['dots','fold','print','stage','sun'].includes(type)){
      if(type==='dots'){
        const offset=rng()*7;
        for(let j=0;j<14;j++)for(let i=0;i<15;i++){
          const x=i*17+(j%2?8:0)+offset,y=22+j*13;
          disc(ctx,x,y,.5+Math.abs(Math.sin(i*.37+j*.29))*2.1,ink);
        }
      }else if(type==='sun'||type==='stage'){
        const x=type==='stage'?44:focus, y=type==='stage'?30:95;
        ray(ctx,x,y,172,type==='stage'?31:62,spot,rng);
        if(type==='sun')disc(ctx,x,y,29,spot);
      }else{
        const fx=23+rng()*32;
        for(let i=0;i<13;i++)line(ctx,fx+i*15,37,fx+i*15+(type==='fold'?24:0),197,ink,.55);
        if(type==='print')for(let k=0;k<5;k++)line(ctx,32,163+k*4,81+rng()*61,162+k*4,ink,.7);
      }
    }
    ctx.restore();
    // Deliberately irregular flecks imitate porous paper, independently for each subject.
    ctx.save();ctx.fillStyle=ink;ctx.globalAlpha=.085;
    for(let i=0;i<190;i++){const x=rng()*240,y=rng()*240;ctx.fillRect(x,y,.34+rng()*.86,.35+rng()*.72);}
    ctx.restore();
  }
  function block(ctx,key,x,y,size,angle,colors,shadow=false){
    if(!blocks[key])return;
    const [body,cut,accent,etch]=paths(key);
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(size/120,size/120);ctx.translate(-60,-60);
    ctx.lineJoin='round';ctx.lineCap='round';
    if(shadow&&body){ctx.save();ctx.translate(2.2,1.7);ctx.fillStyle=colors[2];ctx.fill(body);ctx.restore();}
    if(body){ctx.fillStyle=colors[1];ctx.fill(body);}
    if(cut){ctx.fillStyle=colors[0];ctx.fill(cut);}
    if(accent){ctx.fillStyle=colors[2];ctx.fill(accent);}
    if(etch){ctx.strokeStyle=colors[1];ctx.lineWidth=1.45;ctx.stroke(etch);}
    if(key==='pumpkin'){
      ctx.save();ctx.clip(body);ctx.fillStyle=colors[0];
      for(let row=0;row<8;row++)for(let col=0;col<12;col++){
        const px=15+col*8.5+(row%2)*3,py=39+row*8;
        disc(ctx,px,py,1.3+1.35*(1-Math.min(1,Math.abs(px-60)/55)),colors[0]);
      }
      ctx.restore();
    }
    ctx.restore();
  }
  const additions={
    print:['quillpot','tablet','scroll','feather'],cells:['microscope','flask','leaf','bottle'],
    orbit:['planet','telescope','stars','lens'],signal:['lens','atom','radio','gridpaper'],
    water:['ship','wave','compass','globe'],blueprint:['gridpaper','wheelgear','compass','arch'],
    sport:['medal','wing','hourglass','ball'],staff:['violin','keyboard','flute','drum'],
    field:['leaf','flower','tree','lens'],ruin:['column','arch','tablet','niche'],
    fold:['scroll','book','feather','gridpaper'],contour:['scrollmap','mountain','compass','globe']
  };
  function draw(canvas,info,year,large){
    const ctx=canvas.getContext('2d');
    if(!ctx || typeof Path2D!=='function')return;
    const rng=random(info.seed);
    const colors=plateColors(info);
    const [paper,ink,spot]=colors;
    const px=large?660:420;canvas.width=px;canvas.height=px;
    ctx.scale(px/240,px/240);ctx.fillStyle=paper;ctx.fillRect(0,0,240,240);
    const style=Math.floor(rng()*5), flip=rng()>.52?-1:1;
    const focus=120+flip*(12+rng()*11);
    // Different plate geometries leave room for the name, keep the block legible at thumbnail size.
    ctx.save();
    if(style===0||style===4){
      ctx.beginPath();ctx.ellipse(120,121,104,87,style===0?-.12:.1,0,TAU);ctx.clip();
    }else{
      ctx.beginPath();ctx.rect(9,30,222,169);ctx.clip();
    }
    background(ctx,info.backdrop,colors,rng,focus);
    ctx.restore();
    ctx.save();ctx.strokeStyle=ink;ctx.globalAlpha=.32;ctx.lineWidth=.7;
    if(style===0||style===4)ellipse(ctx,120,121,104,87,ink,.8,style===0?-.12:.1);
    else if(style===2){line(ctx,10,186,229,186,ink,.7);line(ctx,15,192,224,192,ink,.6);}
    else if(style===3){for(const [x,y,s] of [[9,34,1],[228,34,-1],[9,194,1],[228,194,-1]]){line(ctx,x,y,x+10*s,y,ink,.85);line(ctx,x,y,x,y+(y<100?8:-8),ink,.85);}}
    ctx.restore();
    let companion=info.companion;
    if(!info.personal && rng()>.50){
      const list=(additions[info.backdrop]||[]).filter(key=>key!==info.main);
      if(list.length)companion=list[Math.floor(rng()*list.length)];
    }
    const smallX=120-flip*(48+rng()*12),smallY=100+rng()*61;
    const angle=(rng()-.50)*.28, largeSize=139+rng()*20;
    if(style===1||style===3){
      ctx.save();ctx.globalAlpha=.82;
      block(ctx,companion,smallX,smallY,77+rng()*24,angle-.11,[paper,spot,ink]);ctx.restore();
      block(ctx,info.main,focus,123,largeSize+7,angle,colors,true);
    }else{
      block(ctx,info.main,focus-3*flip,121,largeSize+10,angle,colors,true);
      ctx.save();ctx.globalAlpha=.91;
      block(ctx,companion,smallX,155+rng()*12,66+rng()*15,-angle*.7,[paper,spot,ink]);ctx.restore();
    }
    // Small material marks are keyed to the actual name, in the way a printer cuts a proof.
    const glyphs=Array.from(info.name),wide=70;
    ctx.save();ctx.globalAlpha=.57;
    let sx=16;for(const c of glyphs.slice(0,16)){
      const code=c.codePointAt(0), w=1+(code%3), h=1.6+((code>>>3)%8)*.5;
      ctx.fillStyle=(code%4===0)?spot:ink;ctx.fillRect(sx,208-h,w,h);sx+=w+1.8;
      if(sx>wide)break;
    }
    if(year!==null)line(ctx,16,210,sx+3,210,ink,.55);
    ctx.restore();
  }
  function label(record){
    const info=concept(record);
    return (info.personal?'召喚の象徴・':'召喚の図案・')+info.title;
  }
  function render(record,options={}){
    const info=concept(record);
    const el=document.createElement('figure');
    const large=Boolean(options?.large);
    el.className='sr-relic'+(large?' sr-relic--large':'');
    const colors=plateColors(info);
    for(const [i,varName] of ['--sr-paper','--sr-ink','--sr-spot'].entries())el.style.setProperty(varName,colors[i]);
    const title=(info.personal?'召喚の象徴・':'召喚の図案・')+info.title;
    el.setAttribute('role','img');el.setAttribute('aria-label',info.name+'　'+title);el.title=title;
    el.dataset.relic=info.main;el.dataset.motif=info.title;
    if(info.personal && record?.article)el.dataset.source=record.article;
    const c=document.createElement('canvas');c.className='sr-relic__drawing';c.setAttribute('aria-hidden','true');el.append(c);
    const rawYear=record?.year;
    const parsed=Number(rawYear);
    const year=rawYear!==null && rawYear!==undefined && rawYear!=='' && Number.isFinite(parsed)?Math.trunc(parsed):null;
    if(year!==null){
      const date=document.createElement('span');date.className='sr-relic__year';date.textContent=year<0?'紀元前 '+Math.abs(year):String(year);el.append(date);
    }
    const name=document.createElement('span');name.className='sr-relic__name'+(Array.from(info.name).length>12?' sr-relic__name--long':'');name.textContent=info.name;el.append(name);
    draw(c,info,year,large);
    return el;
  }
  window.SurvivalRelics=Object.freeze({render,label});
})();
