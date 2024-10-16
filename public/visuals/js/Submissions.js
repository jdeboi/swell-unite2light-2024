const submissions = [
  {
    text: "A future where clean energy powers every home and vehicle, leaving the air crisp and the skies clear.",
    disturbance: 0.1,
    waveSpeed: 0.3,
    colorVals: ["#00BFFF", "#FFD700", "#00FF7F"],
    colors: [],
    explanation:
      "Sky blue, warm gold, and bright green to evoke energy, clarity, and freshness.",
  },
  {
    text: "An ecosystem where the ocean thrives, free from pollution, and marine life is abundant.",
    disturbance: 0.2,
    waveSpeed: 0.4,
    colorVals: ["#1E90FF", "#FF6347", "#32CD32"],
    colors: [],
    explanation:
      "Deep blue, coral orange, and vibrant green for the dynamic and diverse marine life.",
  },
  {
    text: "A city where drought is no longer a threat because of innovative water conservation and sustainable practices.",
    disturbance: 0.3,
    waveSpeed: 0.5,
    colorVals: ["#00FF7F", "#FFA500", "#4682B4"],
    colors: [],
    explanation:
      "Bright green, orange, and steel blue for balance between growth, warmth, and water conservation.",
  },
  {
    text: "A future where wildfires are minimized through healthy forest management and smart planning.",
    disturbance: 0.7,
    waveSpeed: 0.7,
    colorVals: ["#FF4500", "#008080", "#FFD700"],
    colors: [],
    explanation:
      "Fiery orange, teal for balanced coolness, and warm gold for management and recovery.",
  },
  {
    text: "A thriving agricultural community using regenerative farming techniques that enrich the soil and reduce emissions.",
    disturbance: 0.4,
    waveSpeed: 0.5,
    colorVals: ["#32CD32", "#8B4513", "#FFD700"],
    colors: [],
    explanation:
      "Vibrant green, earthy brown, and golden yellow for growth, soil health, and warmth.",
  },
  {
    text: "A coastline where sea-level rise is managed through green infrastructure and resilient design.",
    disturbance: 0.5,
    waveSpeed: 0.6,
    colorVals: ["#4682B4", "#FFD700", "#32CD32"],
    colors: [],
    explanation:
      "Steel blue, golden yellow, and bright green to represent resilient design and coastal sustainability.",
  },
  {
    text: "A Santa Barbara where beach erosion is a thing of the past, thanks to innovative coastal protection measures.",
    disturbance: 0.2,
    waveSpeed: 0.4,
    colorVals: ["#87CEEB", "#FF8C00", "#6B8E23"],
    colors: [],
    explanation:
      "Light blue, bold orange, and olive green for the balance of clear skies, bold innovation, and nature protection.",
  },
  {
    text: "A community garden on every block, growing organic food and fostering community resilience.",
    disturbance: 0.2,
    waveSpeed: 0.3,
    colorVals: ["#FFD700", "#FFA500", "#32CD32"],
    colors: [],
    explanation:
      "Warm yellow, orange, and vibrant green to represent community, growth, and resilience.",
  },
  {
    text: "A future where every building is carbon-neutral, and Santa Barbara leads the way in sustainable architecture.",
    disturbance: 0.3,
    waveSpeed: 0.4,
    colorVals: ["#708090", "#FFD700", "#32CD32"],
    colors: [],
    explanation:
      "Cool gray, golden yellow, and green to evoke modern sustainability, innovation, and ecological balance.",
  },
  {
    text: "A coastline where wetlands have been restored, creating natural buffers against climate change.",
    disturbance: 0.2,
    waveSpeed: 0.4,
    colorVals: ["#00FA9A", "#8B4513", "#4682B4"],
    colors: [],
    explanation:
      "Mint green, earthy brown, and steel blue to represent restored wetlands, resilience, and natural balance.",
  },
];

let lastProcessSubmission = submissions.length - 1;

function needsToProcessSubmission() {
  return lastProcessSubmission < submissions.length - 1;
}

function finishedDisplayingSubmission() {
  lastProcessSubmission++;
  if (lastProcessSubmission >= submissions.length - 1) {
    lastProcessSubmission = submissions.length - 1;
  }
}

function setNextSubmission() {
  if (needsToProcessSubmission()) {
    lastProcessSubmission++;
  }
}

function getSubmissionToProcess() {
  if (needsToProcessSubmission()) {
    return submissions[lastProcessSubmission + 1];
  }
  return submissions[lastProcessSubmission];
}

function checkForNewSubmission() {
  if (mode == COLLECTIVE || mode == PROCESSING) {
    if (needsToProcessSubmission()) {
      changeMode(SUBMISSION);
    }
  }
}
function processSubmission(data) {
  // console.log("processing submission...");
  try {
    if (
      !data ||
      !data.text ||
      !data.colors ||
      !data.colors.length == 3 ||
      !data.disturbance ||
      !data.waveSpeed
    ) {
      console.log("error with data", data);
      changeMode(ERROR);
      return;
    }
    const latestSubmission = {
      text: data.text,
      colors: [],
      colorVals: data.colors,
      waveSpeed: +data.waveSpeed,
      disturbance: +data.disturbance,
    };
    for (let i = 0; i < data.colors.length; i++) {
      latestSubmission.colors[i] = color(latestSubmission.colorVals[i]);
    }
    submissions.push(latestSubmission);

    sendSubmissionsToAPI();
    
  } catch (e) {
    console.log("error on processing submssion data", e);
    // changeMode(ERROR);
  }
}

function processCollective(data) {
  try {
    if (
      !data ||
      !data.text ||
      !data.colors ||
      !data.colors.length == 3 ||
      !data.disturbance ||
      !data.waveSpeed
    ) {
      console.log("error with collectivedata", data);
      // changeMode(ERROR);
      return;
    }
    collective.text = data.text;
    collective.colorVals = data.colors;
    collective.waveSpeed = +data.waveSpeed;
    collective.disturbance = +data.disturbance;

    for (let i = 0; i < data.colors.length; i++) {
      collective.colors[i] = color(collective.colorVals[i]);
    }

    textDisplay.collectiveTxt = collective.text;
  } catch (e) {
    console.log("error on processing collective data", e);
    // changeMode(ERROR);
  }
}

function sendSubmissionsToAPI() {
  // 10 most recent submissions
  let submisisons10 = submissions.slice(
    lastProcessSubmission - 9,
    lastProcessSubmission + 1
  );

  let submissionsArray = submisisons10.map((submission) => submission.text);

  fetch("/api/getcollective", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      submissions: submissionsArray, // Array of 10 submissions
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log("Processed data received from API:", data);
      processCollective(data); // Update the scene with the processed result
    })
    .catch((error) => {
      console.error("Error sending submissions to API:", error);
      // changeMode(ERROR);
    });
}
