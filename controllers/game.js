
class Game {
  constructor(player, comp) {
    this.player = player;
    this.comp = comp;
    this.result = null;
    this.round = 1;

    // DOM Selector
    this.versus = document.querySelector('.versus h1');
    this.resultClass = document.querySelector('.versus div div');
    this.textResult = document.querySelector('.versus h5');
    this.compBox = document.querySelectorAll('.greyBox.compImage');
    this.playerBox = document.querySelectorAll('.greyBox.playerImage');
  }

  getResult(player, comp) {
    if (player.choice === comp.choice) this.result = 'DRAW';
    if (player.choice === 'rock' && comp.choice === 'scissor') { this.result = 'PLAYER 1 WIN'; }
    if (player.choice === 'rock' && comp.choice === 'paper') { this.result = 'COM WIN'; }
    if (player.choice === 'paper' && comp.choice === 'rock') { this.result = 'PLAYER 1 WIN'; }
    if (player.choice === 'paper' && comp.choice === 'scissor') { this.result = 'COM WIN'; }
    if (player.choice === 'scissor' && comp.choice === 'paper') { this.result = 'PLAYER 1 WIN'; }
    if (player.choice === 'scissor' && comp.choice === 'rock') { this.result = 'COM WIN'; }
  }

  setPlayerGreyBox(player) {
    if (player.choice === 'rock') { this.playerBox[0].style.backgroundColor = '#c4c4c4'; } else if (player.choice === 'paper') { this.playerBox[1].style.backgroundColor = '#c4c4c4'; } else this.playerBox[2].style.backgroundColor = '#c4c4c4';
  }

  setCompGreyBox(comp) {
    if (comp.choice === 'rock') { this.compBox[0].style.backgroundColor = '#c4c4c4'; } else if (comp.choice === 'paper') { this.compBox[1].style.backgroundColor = '#c4c4c4'; } else this.compBox[2].style.backgroundColor = '#c4c4c4';
  }

  showResult(player, comp) {
    this.versus.style.color = '#9c835f';
    this.resultClass.classList.add('result');
    this.textResult.innerHTML = this.result;
    this.textResult.style.backgroundColor = '#4c9654';
    if (this.result === 'DRAW') { this.textResult.style.backgroundColor = '#225c0e'; }
    console.log("Winner:", this.result);
    console.log("player", this.player);
    this.setCompGreyBox(comp);
  }

  compThink() {
    const start = new Date().getTime();
    let i = 0;

    setInterval(() => {
      if (new Date().getTime() - start >= 1000) {
        clearInterval;
        return;
      }
      /* interval pilihan komputer */
      this.compBox[i++].style.backgroundColor = '#c4c4c4';
      if (i == this.compBox.length) i = 0;
    }, 50);

    setTimeout(() => {
      setInterval(() => {
        if (new Date().getTime() - start >= 1200) {
          clearInterval;
          return;
        }
        // Pilih ulang DOM - gak bisa pake this.compBox??
        const compBox = document.querySelectorAll('.greyBox.compImage');
        compBox[i++].style.backgroundColor = '#9c835f';
        if (i == compBox.length) i = 0;
      }, 50);
    }, 50);
  }

  startGame(player, comp) {
    comp.getCompChoice();
    this.getResult(player, comp);
    this.setPlayerGreyBox(player);

    // interval pilihan komputer
    this.compThink();

    // Munculkan result setelah interval pilihan komputer
    setTimeout(() => {
      this.showResult(player, comp);
    }, 1200);
    console.log("Player choice:", player.choice);
    console.log("Comp choice:", comp.choice);
    this.round++;
  }
  // refresh logic, remove result, background, dan text result
  refresh() {
    this.textResult.innerHTML = '';
    this.resultClass.classList.remove('result');
    this.versus.style.color = 'rgb(189,48,46)';
    this.result = null;

    for (let i = 0; i < this.compBox.length; i++) {
      this.playerBox[i].style.backgroundColor = '#9c835f';
      this.compBox[i].style.backgroundColor = '#9c835f';
    }
  }
}

class Player {
  constructor() {
    this.choice = null;
  }

  getPlayerChoice(choice) {
    this.choice = choice;
  }
}
//inherit class player choice ke comp
class Comp extends Player {
  constructor() {
    super();
  }
// Pilihan komputer
  getCompChoice() {
    const choice = Math.random();
    if (choice <= 1 / 3) this.choice = 'rock';
    if (choice > 1 / 3 && choice <= 2 / 3) this.choice = 'paper';
    if (choice > 2 / 3) this.choice = 'scissor';
  }
}

// Initialization 
const p1 = new Player();
const cpu = new Comp();
const game = new Game(p1, cpu);

// Event Listener 
document.querySelectorAll('.contentImage .player').forEach((playerimg) => {
  playerimg.addEventListener('click', () => {
    // hanya bisa di mulai kalo gak ada winner result
    if (!game.result) {
      // Get player choice (dari class kedua dari tiap image), parse dengan substr?
      const playerChoice = playerimg.className.substr(7, 7);

      // Store player choice
      p1.getPlayerChoice(playerChoice);

      // Start the game
      game.startGame(p1, cpu);
      
      // Dapatkan computer choice dan result
      
      const computerChoice = cpu.choice;
      
      const result = game.result;

      // Mengirim data ke server melalui permintaan POST
      sendDataToServer(playerChoice, computerChoice, result);

    } else alert('Please reset the game first.');
  });
});

//Function untuk mengirim data ke API
function sendDataToServer(playerChoice, computerChoice, result) {
  const data = {
    playerChoice: playerChoice,
    computerChoice: computerChoice,
    result: result
  };

  // Kirim permintaan POST ke server
  fetch('/saveResult', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  .then(response => {
    // Periksa apakah respons berhasil
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json(); // Kembalikan respons dalam format JSON
  })
  .then(data => {
    console.log('Success:', data);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  
  const deleteButtons = document.querySelectorAll('.delete-btn');


  // Handle click on delete button
  deleteButtons.forEach(button => {
      button.addEventListener('click', async function() {
          const id = button.dataset.id;
          if (confirm('Are you sure you want to delete this record?')) {
              try {
                  const response = await fetch(`/gamehistory/${id}`, {
                      method: 'DELETE'
                  });
                  if (response.ok) {
                      // Update UI after successful deletion
                      // Example: remove row from table
                      button.closest('tr').remove();
                  } else {
                      // Handle error
                      console.error('Error deleting data');
                  }
              } catch (error) {
                  console.error('Error:', error);
              }
          }
      });
  });
});



////////////////


document.addEventListener('DOMContentLoaded', function() {
    const updateButton = document.querySelector('.update-btn');
    const id = updateButton.dataset.id; // Mendapatkan ID dari data-id atribut pada tombol "Update"
    
    updateButton.addEventListener('click', async function() {
        const playerChoice = document.querySelector('#playerChoice').value;
        const computerChoice = document.querySelector('#computerChoice').value;
        const winner = document.querySelector('#winner').value;
        const response = await fetch(`/gamehistory/update/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ player_choice: playerChoice, comp_choice: computerChoice, winner: winner })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update data');
            }
            return response.json();
        })
        .then(data => {
            console.log('Data updated successfully:', data);
            // Lakukan tindakan selanjutnya jika diperlukan, seperti memperbarui tampilan
        })
        .catch(error => {
            console.error('Error updating data:', error);
            // Lakukan penanganan kesalahan jika diperlukan
        });
    });
});





// Refresh listener
document
  .querySelector('.refresh')
  .addEventListener('click', () => game.refresh());


