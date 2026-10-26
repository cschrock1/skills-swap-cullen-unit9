const skillGrid = document.getElementById("skill-grid");
const categoryFilters = document.querySelector(".category-filters");
const skillCount = document.getElementById("skill-count");
const skillMatchResults = document.getElementById("skill-match-results");
const matchCategory = document.getElementById("match-category");
const createSkillStatus = document.getElementById("create-skill-status");
let skills = [];
let activeCategory = "All";

function renderCategoryFilters() {
    const categories = [...new Set(skills.map((skill) => skill.category))].sort();
    const selectedCategory = matchCategory.value;
    const filters = ["All", ...categories].map((category) => {
        const button = document.createElement("button");
        button.className = "category-filter";
        button.type = "button";
        button.dataset.category = category;
        button.setAttribute("aria-pressed", String(category === activeCategory));
        button.textContent = category;
        if (category === activeCategory) {
            button.classList.add("is-active");
        }
        return button;
    });
    categoryFilters.replaceChildren(...filters);

    const matchOptions = [new Option("Select a category", ""), ...categories.map(
        (category) => new Option(category, category)
    )];
    matchCategory.replaceChildren(...matchOptions);
    matchCategory.value = categories.includes(selectedCategory) ? selectedCategory : "";
}

function renderSkills() {
    const visibleSkills = window.SkillSwapFunctions.filterSkillsByCategory(skills, activeCategory);
    skillGrid.replaceChildren();

    visibleSkills.forEach((skill, index) => {
        const card = document.createElement("article");
        const detailsId = `skill-details-${index}`;
        card.className = "skill-card";
        card.dataset.category = skill.category;
        card.dataset.price = String(Number(skill.price));

        const title = document.createElement("h3");
        title.textContent = skill.title;
        const description = document.createElement("p");
        description.textContent = skill.description;
        const provider = document.createElement("p");
        provider.className = "skill-provider";
        provider.textContent = `Offered by ${skill.provider}`;
        const price = document.createElement("p");
        price.className = "skill-price";
        price.textContent = Number(skill.price) === 0
            ? "Free session"
            : `$${Number(skill.price)} per session`;
        const toggle = document.createElement("button");
        toggle.className = "skill-toggle";
        toggle.type = "button";
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-controls", detailsId);
        toggle.textContent = "More about this skill";
        const details = document.createElement("p");
        details.className = "skill-details";
        details.id = detailsId;
        details.hidden = true;
        details.textContent = skill.description;

        card.append(title, description, provider, price, toggle, details);
        skillGrid.append(card);
    });

    skillCount.textContent =
        `${visibleSkills.length} skill${visibleSkills.length === 1 ? "" : "s"} found.`;
}

function refreshSkills() {
    return window.apiService.fetchSkills().then((loadedSkills) => {
        if (!Array.isArray(loadedSkills)) {
            throw new TypeError("The skills API returned an invalid response.");
        }
        skills = loadedSkills;
        if (activeCategory !== "All" && !skills.some((skill) => skill.category === activeCategory)) {
            activeCategory = "All";
        }
        renderCategoryFilters();
        renderSkills();
    });
}

categoryFilters.addEventListener("click", (event) => {
    const button = event.target.closest(".category-filter");
    if (!button) {
        return;
    }
    activeCategory = button.dataset.category;
    renderCategoryFilters();
    renderSkills();
});

skillGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".skill-toggle");
    if (button) {
        const detailsId = button.getAttribute("aria-controls");
        const details = detailsId ? document.getElementById(detailsId) : null;

        if (!details) {
            throw new Error(`Skill details not found for button: ${detailsId}`);
        }

        const isExpanded = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!isExpanded));
        button.textContent = isExpanded ? "More about this skill" : "Hide details";
        details.hidden = isExpanded;
    }
});

document.getElementById("cost-calculator-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const hourlyRate = document.getElementById("hourly-rate").valueAsNumber;
    const hours = document.getElementById("lesson-hours").valueAsNumber;
    const total = window.SkillSwapFunctions.calculateTotalCosts(hourlyRate, hours);
    document.getElementById("cost-calculator-result").textContent =
        `Total cost: $${total.toFixed(2)}`;
});

document.getElementById("skill-matcher-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const userNeeds = {
        category: matchCategory.value,
        maxPrice: document.getElementById("match-max-price").valueAsNumber
    };
    const matches = window.SkillSwapFunctions.matchSkillsToUser(userNeeds, skills);
    skillMatchResults.replaceChildren();

    if (matches.length === 0) {
        const emptyResult = document.createElement("li");
        emptyResult.textContent = "No skills match that category and budget. Try a higher maximum price.";
        skillMatchResults.append(emptyResult);
        return;
    }

    matches.forEach((skill) => {
        const result = document.createElement("li");
        result.textContent = `${skill.title} — ${skill.price === 0 ? "Free" : `$${skill.price}`} per session`;
        skillMatchResults.append(result);
    });
});

document.getElementById("create-skill-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const submitButton = form.querySelector('button[type="submit"]');
    const skillData = {
        title: document.getElementById("skill-title").value.trim(),
        category: document.getElementById("skill-category").value.trim(),
        price: document.getElementById("skill-price").valueAsNumber,
        provider: document.getElementById("skill-provider").value.trim(),
        description: document.getElementById("skill-description").value.trim()
    };

    submitButton.disabled = true;
    createSkillStatus.textContent = "Saving skill...";
    let created = false;
    try {
        await window.apiService.createSkill(skillData);
        created = true;
        form.reset();
        createSkillStatus.textContent = "Skill saved. Refreshing the listings...";
        await refreshSkills();
        createSkillStatus.textContent = "Skill added successfully.";
    } catch (error) {
        createSkillStatus.textContent = created
            ? `Skill was saved, but listings could not be refreshed: ${error.message}`
            : `Unable to add skill: ${error.message}`;
    } finally {
        submitButton.disabled = false;
    }
});

refreshSkills().catch((error) => {
    skillCount.textContent = "Skills could not be loaded.";
    createSkillStatus.textContent = `Unable to connect to the skills API: ${error.message}`;
});