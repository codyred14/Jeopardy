// Define the base url for the API endpoint
const BASE_API_URL = "https://jservice.io/api/";
// Number of categories to fetch and display
const NUM_CATEGORIES = 6;
// Number of clues per category to fetch and display
const NUM_CLUES_PER_CAT = 5;

// Array to hold the categories and their clues
let categories = [];

// Function to fetch and return category ids from the API
async function getCategoryIds() {
    // Use axios to make a GET request to the API for categories
    let response = await axios.get(`${BASE_API_URL}categories?count=100`);
    // Extract the id from each category object in the response data
    let catIds = response.data.map(c => c.id);
    // Use lodash to randomly select NUM_CATEGORIES ids from the extracted ids
    return _.sampleSize(catIds, NUM_CATEGORIES);
}

// Function to fetch and return a single category and its clues from the API
async function getCategory(catId) {
    // Use axios to make a GET request to the API for a single category
    let response = await axios.get(`${BASE_API_URL}category?id=${catId}`);
    // Extract the category object from the response data
    let cat = response.data;
    // Extract all clues from the category object
    let allClues = cat.clues;
    // Use lodash to randomly select NUM_CLUES_PER_CAT clues from the allClues
    let randomClues = _.sampleSize(allClues, NUM_CLUES_PER_CAT);
    // Create a new clues array that includes the question and answer, and sets the initial value of showing to null
    let clues = randomClues.map(c => ({
        question: c.question,
        answer: c.answer,
        showing: null,
    }));

    // Return the category title and the new clues array
    return { title: cat.title, clues };
}

// Function to fill the table with the categories and clues
async function fillTable() {
    // Clear the thead of the jeopardy table
    $("#jeopardy thead").empty();
    // Create a new table row
    let $tr = $("<tr>");
    // Loop through the number of categories
    for (let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++) {
        // Append a table header element with the category title to the row
        $tr.append($("<th>").text(categories[catIdx].title));
    }
    // Append the row to the thead of the jeopardy table
    $("#jeopardy thead").append($tr);

    // Clear the tbody of the jeopardy table
    $("#jeopardy tbody").empty();
    // Loop through the number of clues per category
    for (let clueIdx = 0; clueIdx < NUM_CLUES_PER_CAT; clueIdx++) {
        // Create a new table row
        let $tr = $("<tr>");
        // Loop through the number of categories
        for (let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++) {
            // Append a table data element with the id set to "catIdx-clueIdx" and the text set to "?" to the row
            $tr.append($("<td>").attr("id", `${catIdx}-${clueIdx}`).text("?"));
        }
        // Append the row to the tbody of the jeopardy table
        $("#jeopardy tbody").append($tr);
    }
}

// Function to handle clicks on the table cells
function handleClick(evt) {
    // Extract the id of the clicked table cell
    let id = evt.target.id;
    // Use destructuring assignment to extract the catId and clueId from the id
    let [catId, clueId] = id.split("-");
    // Get the clue object from the categories array
    let clue = categories[catId].clues[clueId];

    // Initialize a variable to hold the message to display
    let msg;
    // Check if the clue is not currently showing
    if (!clue.showing) {
        // Set the message to the question
        msg = clue.question;
        // Set the showing property of the clue to "question"
        clue.showing = "question";
        // Check if the clue is currently showing the question
    } else if (clue.showing === "question") {
        // Set the message to the answer
        msg = clue.answer;
        // Set the showing property of the clue to "answer"
        clue.showing = "answer";
    }
    // If the clue is already showing the answer
    else {
        // Exit the function
        return
    }
    // Set the html of the table cell with the id of "catId-clueId" to the message
    $(`#${catId}-${clueId}`).html(msg);
}

// Function to set up and start the game
async function setupAndStart() {
    // Get the category ids
    let catIds = await getCategoryIds();
    // Clear the categories array
    categories = [];
    // Loop through the category ids
    for (let catId of catIds) {
        // Push the category object to the categories array
        categories.push(await getCategory(catId));
    }
    // Fill the table with the categories and clues
    fillTable();
}

// Event listener for the "restart" button
$("#restart").on("click", function () {
    // Reload the page
    location.reload();
});

// Wait for the document to be ready, then set up and start the game and add an event listener for clicks on the table cells
$(async function () {
    setupAndStart();
    $("#jeopardy").on("click", "td", handleClick);
}
);

