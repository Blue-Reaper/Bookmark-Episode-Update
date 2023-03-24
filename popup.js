// Get the current URL
var currentTab;
browser.tabs.query({
  active: true,
  currentWindow: true
}).then((tabs) => {
  currentTab = tabs[0];
  return browser.bookmarks.getTree();
});

var regex = /s(\d+) e(\d+)/;
var title = document.getElementById("title");
var debug = document.getElementById("debug");

// Compare the current URL to the bookmarks and display matches
browser.bookmarks.getTree().then((bookmarkTreeNodes) => {
  let bookmarkMatches = getBookmarkMatches(bookmarkTreeNodes, currentTab.url);
  // if (bookmarkMatches.length > 0) {
  //   title.textContent = "Found matches:<br>";
  //   for (var i = 0; i < bookmarkMatches.length; i++) {
  //     title.textContent += bookmarkMatches[i].title + "<br>";
  //   }
  if (bookmarkMatches.length == 1) {
    title.textContent = bookmarkMatches[0].title;

    // Create Button Episode +1
    let b_episode = document.createElement("button");
    b_episode.textContent = "Episode +1";
    b_episode.onclick = function() {
      updateBookmarkNode(bookmarkMatches[0].id, incrementTitle(bookmarkMatches[0].title, true));
    };
    
    // Create Button Season +1
    let b_season = document.createElement("button");
    b_season.textContent = "Season +1";
    b_season.onclick = function() {
      updateBookmarkNode(bookmarkMatches[0].id, incrementTitle(bookmarkMatches[0].title, false));
    };

    document.getElementById("buttons").appendChild(b_season);
    document.getElementById("buttons").appendChild(b_episode);
  } else {
    title.textContent = `No matches found: ${bookmarkMatches.length}`;
  }
});

// Recursively search the bookmarks for matches
function getBookmarkMatches(bookmarkTreeNodes, targetURL) {
  let bookmarkMatches = [];
  for (let i = 0; i < bookmarkTreeNodes.length; i++) {
    let bookmarkNode = bookmarkTreeNodes[i];
    if (bookmarkNode.url) {
      // Matches URL
      if (matchURLs(bookmarkNode.url, targetURL)) {
        bookmarkMatches.push(bookmarkNode);
      }
    } else if (bookmarkNode.children) {
      bookmarkMatches = bookmarkMatches.concat(getBookmarkMatches(bookmarkNode.children, targetURL));
    }
  }
  return bookmarkMatches;
}

// compares URLs match everything to last path part and last path part must match except digits
function matchURLs(url1, url2) {
  // Split the URLs into parts
  let parts1 = url1.split('/');
  let parts2 = url2.split('/');

  // Find the last non-empty part (if url ends with /)
  let i = parts1.length - 1;
  while (i >= 0 && !parts1[i]) {
    i--;
  }
  let lastNonEmpty1 = parts1[i];

  i = parts2.length - 1;
  while (i >= 0 && !parts2[i]) {
    i--;
  }
  let lastNonEmpty2 = parts2[i];

  // Compare the non-empty parts
  let parts1ToCompare = parts1.slice(0, i);
  let parts2ToCompare = parts2.slice(0, i);
  if (parts1ToCompare.join('/') !== parts2ToCompare.join('/')) {
    return false;
  }

  // Compare the last parts without numbers
  let lastPart1 = lastNonEmpty1.replace(/\d+/g, '');
  let lastPart2 = lastNonEmpty2.replace(/\d+/g, '');
  return lastPart1 === lastPart2;
}


// // Compare URLs - match except last path part
// function matchURLs(urlA, urlB) {
//   let pathA = urlA.split("/");
//   let pathB = urlB.split("/");

//   // Compare everything except last / part
//   let baseA = pathA.slice(0, pathA.length - 1).join("/");
//   let baseB = pathB.slice(0, pathB.length - 1).join("/");
// debug.innerHTML = baseB;
//   if (baseA === baseB) {
//     return true;
//   } else {
//     return false;
//   }

// }

// Update bookmark
async function updateBookmarkNode(bookmarkId, newTitle) {
  await browser.bookmarks.update(bookmarkId, {
      url: currentTab.url,
      title: newTitle
    })
    .then(() => location.reload())
    // .then(() => title.textContent = newTitle)
    .catch(error => debug.textContent = error);
}

// increment Episode or Season in Title
function incrementTitle(title, isEpisode) {
  let match = regex.exec(title);
  if (match) {
    let newTitle;
    if(isEpisode){
      newTitle = `s${match[1]} e${Number(match[2]) + 1}${title.slice(match[0].length)}`;
    } else {
      newTitle = `s${Number(match[1]) + 1} e${match[2]}${title.slice(match[0].length)}`;
    }
    return newTitle;
  }
  return title;
}
