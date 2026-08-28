const nameInput = document.getElementById("Input");
const wheel = document.getElementById("wheel");
const wheelNames = document.querySelector(".wheel-names");
const rotationbt = document.querySelector(".clickbt");
const modalOverlay = document.getElementById("modalOverlay");
const winnerNameDisplay = document.getElementById("winnerName");
const btnContinue = document.getElementById("btnContinue");
const btnRemove = document.getElementById("btnRemove");

const colors = [
    "hsla(51, 95%, 48%, 0.90)", 
    "rgb(24, 102, 220)", 
    "hsl(122, 85%, 37%)", 
    "rgb(167, 42, 33)"  
];

let names = [];
let currentRotation = 0;
let isSpinning = false;
let currentWinnerIndex = -1;

function getColor(index) {
    let colorIndex = index % colors.length;
    if (index === names.length - 1 && colorIndex === 0 && names.length > 1) {
        colorIndex = 1;
    }
    return colors[colorIndex];
}

function updateWheel() {
    if (names.length === 0) {
        wheel.style.background = "gray";
        return;
    }
    const angle = 360 / names.length;
    let gradientParts = [];
    names.forEach(function(name, index) {
        const startAngle = index * angle;
        const endAngle = (index + 1) * angle;
        const color = getColor(index);
        gradientParts.push(`${color} ${startAngle}deg ${endAngle}deg`);
    });
    wheel.style.background = `conic-gradient(from 90deg, ${gradientParts.join(", ")})`;
}


function getFontSize(count) {
    if (count <= 6) return 24;  
    if (count <= 12) return 18; 
    if (count <= 20) return 14; 
    if (count <= 30) return 12;
    return 10;                 
}

function updateNames() {
    wheelNames.innerHTML = "";
    if (names.length === 0) {
        return;
    }
    
    const angle = 360 / names.length;
    const radius = 160; 
    const currentFontSize = getFontSize(names.length);

    names.forEach(function(name, index) {
        const middleAngle = index * angle + angle / 2;
        const nameElement = document.createElement("div");

        nameElement.classList.add("wheel-name");
        nameElement.textContent = name;
        nameElement.style.fontSize = `${currentFontSize}px`;
        
        let flipAngle = 0;

        if (middleAngle > 90 && middleAngle < 270) {
            flipAngle = 180;
        }

        nameElement.style.transform =
            `
            rotate(${middleAngle}deg)
            translateX(${radius}px)
            rotate(${flipAngle}deg)
            translate(-50%, -50%)
            `;
            
        wheelNames.appendChild(nameElement);
    });
}

function spinWheel() {
    isSpinning = true;
    rotationbt.style.pointerEvents = "none";

    const winnerIndex = Math.floor(Math.random() * names.length);
    const winner = names[winnerIndex];
    console.log("Người thắng:", winner);

    const angle = 360 / names.length;
    const winnerAngle = winnerIndex * angle + angle / 2;
    const pointerAngle = 0;

    let absoluteTarget = pointerAngle - winnerAngle;
    if (absoluteTarget < 0) {
        absoluteTarget += 360;
    }
    let currentMod = currentRotation % 360; 
    let rotateDiff = absoluteTarget - currentMod; 
    
    if (rotateDiff < 0) {
        rotateDiff += 360;
    }

    const fullSpins = 6;
    const rotationToAdd = rotateDiff + (fullSpins * 360);

    currentRotation += rotationToAdd;

    wheel.style.transition = "transform 5s cubic-bezier(0.12, 0.8, 0.2, 1)";
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(function() {
        currentWinnerIndex = winnerIndex;
        winnerNameDisplay.textContent = winner;    
        modalOverlay.classList.add("show");
        isSpinning = false;
        rotationbt.style.pointerEvents = "auto";
    }, 5000);
}

nameInput.addEventListener("input", function() {
    const text = nameInput.value;
    const rawNames = text.split('\n');

    names = rawNames.map(name => name.trim()).filter(name => name !== "");

    updateWheel();
    updateNames();
});

rotationbt.addEventListener("click", function() {
    if (isSpinning) {
        return;
    }
    spinWheel();
});

btnContinue.addEventListener("click", function() {
    modalOverlay.classList.remove("show");
});

btnRemove.addEventListener("click", function() {
    if (currentWinnerIndex !== -1) {
        names.splice(currentWinnerIndex, 1);
        nameInput.value = names.join("\n");
        
        updateWheel();
        updateNames();
    }
    modalOverlay.classList.remove("show");
});