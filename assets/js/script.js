// Initialize Locomotive Scroll with GSAP ScrollTrigger integration
function initLocoScroll() {
  gsap.registerPlugin(ScrollTrigger);

  const locoScroll = new LocomotiveScroll({
    el: document.querySelector("#main"),
    smooth: true
  });

  // Sync Locomotive Scroll with ScrollTrigger
  locoScroll.on("scroll", ScrollTrigger.update);

  // Configure ScrollTrigger proxy for Locomotive Scroll
  ScrollTrigger.scrollerProxy("#main", {
    scrollTop(value) {
      return arguments.length 
        ? locoScroll.scrollTo(value, 0, 0) 
        : locoScroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight
      };
    },
    pinType: document.querySelector("#main").style.transform ? "transform" : "fixed"
  });

  // Refresh ScrollTrigger and Locomotive on updates
  ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
  ScrollTrigger.refresh();
}

initLocoScroll();

// Helper function to split text into spans
function splitTextIntoSpans(selector) {
  const element = document.querySelector(selector);
  if (!element) return;
  
  const text = element.textContent;
  let clutter = "";
  
  text.split("").forEach(char => {
    clutter += `<span>${char}</span>`;
  });
  
  element.innerHTML = clutter;
  
  // Return the selector for the spans for GSAP animation
  return `${selector}>span`;
}

// Animate text with GSAP
function animateText(selector, color = "#fff") {
  const target = splitTextIntoSpans(selector);
  
  if (!target) return;
  
  gsap.to(target, {
    scrollTrigger: {
      trigger: target,
      start: "top bottom",
      end: "bottom top",
      scroller: "#main",
      scrub: 0.5
    },
    stagger: 0.2,
    color: color
  });
}

// Initialize text animations
animateText("#page2>h1");
animateText("#page4>h1");
animateText("#page6>h1");

// Canvas animation helper
function initCanvasAnimation(selector, frameCount, imagePaths, pinOptions = {}) {
  const canvas = document.querySelector(`${selector}>canvas`);
  if (!canvas) return;
  
  const context = canvas.getContext("2d");
  let imagesLoaded = 0;
  
  // Set canvas dimensions
  function setCanvasDimensions() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  setCanvasDimensions();
  window.addEventListener("resize", setCanvasDimensions);

  // Image sequence object
  const imageSeq = { frame: 0 };
  const images = [];

  // Load images
  function loadImages() {
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = imagePaths[i];
      
      img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === 1) render(); // Render first loaded image
      };
      
      img.onerror = () => {
        console.error(`Failed to load image: ${imagePaths[i]}`);
      };
      
      images.push(img);
    }
  }

  // Render current frame
  function render() {
    if (!images[imageSeq.frame] || !images[imageSeq.frame].complete) return;
    scaleImage(images[imageSeq.frame], context);
  }

  // Scale and draw image
  function scaleImage(img, ctx) {
    const canvas = ctx.canvas;
    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.max(hRatio, vRatio);
    const centerShiftX = (canvas.width - img.width * ratio) / 2;
    const centerShiftY = (canvas.height - img.height * ratio) / 2;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Only draw if image is loaded
    if (img.complete && img.naturalWidth !== 0) {
      ctx.drawImage(
        img,
        0, 0,
        img.width, img.height,
        centerShiftX, centerShiftY,
        img.width * ratio, img.height * ratio
      );
    }
  }

  // Set up GSAP animation
  function setupAnimation() {
    gsap.to(imageSeq, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        scrub: 0.5,
        trigger: selector,
        start: "top top",
        end: "250% top",
        scroller: "#main",
        onUpdate: render
      }
    });

    ScrollTrigger.create({
      trigger: selector,
      pin: true,
      scroller: "#main",
      start: "top top",
      end: "250% top",
      ...pinOptions
    });
  }

  loadImages();
  setupAnimation();
}

// Image paths for different sections
const cylinderFrames = Array.from({ length: 67 }, (_, i) => 
  `../images/cylinder_frames/frames${String(i * 3 + 7).padStart(5, '0')}.png`
);

const bridgesFrames = Array.from({ length: 67 }, (_, i) =>
  `../../images/bridges_frames/bridges${String(i * 3 + 4).padStart(5, '0')}.png`
);

const loreFrames = Array.from({ length: 136 }, (_, i) =>
  `https://thisismagma.com/assets/home/lore/seq/${i + 1}.webp?2`
);

console.log("Cylinders:", cylinderFrames);
console.log("Cylinders:", bridgesFrames);

// Initialize canvas animations
initCanvasAnimation("#page3", 67, cylinderFrames);
// initCanvasAnimation("#page5", 67, bridgesFrames);
// initCanvasAnimation("#page7", 136, loreFrames);

// Additional page 7 animations
gsap.to(".page7-cir", {
  scrollTrigger: {
    trigger: ".page7-cir",
    start: "top center",
    end: "bottom top",
    scroller: "#main",
    scrub: 0.5
  },
  scale: 1.5
});

gsap.to(".page7-cir-inner", {
  scrollTrigger: {
    trigger: ".page7-cir-inner",
    start: "top center",
    end: "bottom top",
    scroller: "#main",
    scrub: 0.5
  },
  backgroundColor: "#0a3bce91"
});