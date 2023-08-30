document.addEventListener("DOMContentLoaded", function () {
  const collectionIDs = [
    "0x4b9c90ebb1fa98d9724db46c4689994b46706f5a", // items
    "0xb809ed839c691d465e2ec45e1bcb5e5aded50fb9" // heroes
  ];

  const collectionsURL = 'https://api.paintswap.finance/v2/collections';
  const collectionResults = document.getElementById('result-container');

  const headers = {
    'Accept': 'application/json'
  };

  fetch('https://api.estfor.com/global-player-stats', {
    method: 'GET',
    headers: headers
  })
    .then(function (res) {
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res.json();
    })
    .then(function (playerStatsResponse) {
      console.log('Player Stats API Response:', playerStatsResponse);

      const globalPlayerStats = playerStatsResponse.globalPlayerStats;

      const totalPlayers = parseFloat(globalPlayerStats.totalPlayers);

      fetch('https://api.estfor.com/global-user-stats', {
        method: 'GET',
        headers: headers
      })
        .then(function (userStatsRes) {
          if (!userStatsRes.ok) {
            throw new Error('Network response was not ok');
          }
          return userStatsRes.json();
        })
        .then(function (userStatsResponse) {
          console.log('User Stats API Response:', userStatsResponse);

          const globalUserStats = userStatsResponse.globalUserStats;

          const totalSoldWei = parseFloat(globalUserStats.totalSold);
          const totalBoughtWei = parseFloat(globalUserStats.totalBought);
          const totalBrushBurnedWei = parseFloat(globalUserStats.totalBrushBurned);

          const totalSoldEther = totalSoldWei / Math.pow(10, 18);
          const totalBoughtEther = totalBoughtWei / Math.pow(10, 18);
          const totalBrushBurnedEther = totalBrushBurnedWei / Math.pow(10, 18);

          const averageSoldEther = totalSoldEther / totalPlayers;
          const averageBoughtEther = totalBoughtEther / totalPlayers;
          const revenuePerUserEther = totalBrushBurnedEther / totalPlayers;

          fetch('https://api.estfor.com/global-donation-stats', {
            method: 'GET',
            headers: headers
          })
            .then(function (donationRes) {
              if (!donationRes.ok) {
                throw new Error('Network response was not ok');
              }
              return donationRes.json();
            })
            .then(function (donationResponse) {
              console.log('Donation Stats API Response:', donationResponse);

              const globalDonationStats = donationResponse.globalDonationStats;

              const totalDonatedWei = parseFloat(globalDonationStats.totalDonatedAmount);
              const totalDonatedEther = totalDonatedWei / Math.pow(10, 18);
              const totalDonatedEtherNoFF = totalDonatedEther - 354000;

              const numUsersDonated = parseFloat(globalDonationStats.numUsersDonated);
              const numUsersDonatedNoFF = numUsersDonated - 1;

              const totalDonatedPerUserEther = numUsersDonated !== 0 ? totalDonatedEther / numUsersDonated : 0;
              const totalDonatedPerUserEtherNoFF = numUsersDonatedNoFF !== 0 ? totalDonatedEtherNoFF / numUsersDonatedNoFF : 0;

              fetch('https://api.coingecko.com/api/v3/simple/price?ids=paint-swap&vs_currencies=usd', {
                method: 'GET',
                headers: headers
              })
                .then(function (priceRes) {
                  if (!priceRes.ok) {
                    throw new Error('BRUSH price fetch failed');
                  }
                  return priceRes.json();
                })
                .then(function (priceResponse) {
                  console.log('Price Response:', priceResponse);

                  const brushPriceUSD = priceResponse['paint-swap'] ? priceResponse['paint-swap'].usd : 'N/A';
                  const totalGeneratedUsd = totalBrushBurnedEther * brushPriceUSD;

                  const resultContainer = document.getElementById('result-container');
                  resultContainer.innerHTML = `
            <p><span class="title">Total Users:</span> ${totalPlayers.toLocaleString()}</p>
            <p><span class="title">Total Sold:</span> ${totalSoldEther.toLocaleString()} BRUSH</p>
            <p><span class="title">Total Bought:</span> ${totalBoughtEther.toLocaleString()} BRUSH</p>
            <p><span class="title">Average Sold per User:</span> ${averageSoldEther.toLocaleString()} BRUSH</p>
            <p><span class="title">Average Bought per User:</span> ${averageBoughtEther.toLocaleString()} BRUSH</p>
            <p><span class="title">Total Donated:</span> ${totalDonatedEther.toLocaleString()} BRUSH</p>
            <p><span class="title">Number of Users Donated:</span> ${numUsersDonated.toLocaleString()}</p>
            <p><span class="title">Average Donated per User:</span> ${totalDonatedPerUserEther.toLocaleString()} BRUSH</p>
            <p><span class="title">Average Donated per User minus FF:</span> ${totalDonatedPerUserEtherNoFF.toLocaleString()} BRUSH</p>
          `;

                  fetch(collectionsURL)
                    .then(response => response.json())
                    .then(data => {
                      const collections = data.collections;

                      fetch('https://api.coingecko.com/api/v3/simple/price?ids=fantom&vs_currencies=usd', {
                        method: 'GET',
                        headers: headers
                      })
                        .then(priceRes => {
                          if (!priceRes.ok) {
                            throw new Error('FTM price fetch failed');
                          }
                          return priceRes.json();
                        })
                        .then(priceResponse => {
                          const ftmPriceUSD = priceResponse['fantom'] ? priceResponse['fantom'].usd : 'N/A';
                          let totalRoyaltiesUSD = 0;

                          collectionIDs.forEach(collectionID => {
                            const collection = collections.find(item => item.id === collectionID);
                            if (collection) {
                              const totalVolumeWei = parseFloat(collection.stats.totalVolumeTraded);
                              const totalVolumeFantom = totalVolumeWei / Math.pow(10, 18);
                              const onePercentFantom = totalVolumeFantom * 0.01;
                              const onePercentUSD = onePercentFantom * ftmPriceUSD;
                          
                              // Add the current royalty to the total
                              totalRoyaltiesUSD += parseFloat(onePercentUSD.toFixed(2));
                          
                              const collectionInfo = document.createElement('p');
                              collectionInfo.innerHTML = `<span class="title">Royalties:</span> ${onePercentFantom.toFixed(4)} FTM ($${onePercentUSD.toFixed(2)})`;
                              resultContainer.appendChild(collectionInfo);
                            } else {
                              const collectionInfo = document.createElement('p');
                              collectionInfo.textContent = `Collection with ID ${collectionID} not found.`;
                              resultContainer.appendChild(collectionInfo);
                            }
                          });
                          
                          // Add the combined USD value to the result container
                          const combinedUSDInfo = document.createElement('p');
                          combinedUSDInfo.innerHTML = `<span class="title">Combined USD Revenue total:</span> $${(totalGeneratedUsd + totalRoyaltiesUSD).toFixed(2)}`;
                          resultContainer.appendChild(combinedUSDInfo);

                        // Calculate the revenue per user in USD (excluding royalties)
                        const revenuePerUserEtherUSD = revenuePerUserEther * brushPriceUSD;

                        // Calculate the total revenue per user (including royalties)
                        const totalRevenuePerUserUSD = revenuePerUserEtherUSD + totalRoyaltiesUSD / totalPlayers;

                        // Create the display element for total revenue per user
                        const totalRevenuePerUserUSDInfo = document.createElement('p');
                        totalRevenuePerUserUSDInfo.innerHTML = `<span class="title">Revenue Per User USD:</span> $${totalRevenuePerUserUSD.toFixed(6)}`;
                        resultContainer.appendChild(totalRevenuePerUserUSDInfo);

                        })



                        
                        .catch(priceError => {
                          console.error('FTM Price Fetch Error:', priceError);
                        });
                    })
                    .catch(error => {
                      console.error('Error fetching collections:', error);
                    });
                })
                .catch(priceError => {
                  console.error('BRUSH Price Fetch Error:', priceError);
                });
            })
            .catch(userStatsError => {
              console.error('User Stats Error:', userStatsError);
            });
        })
        .catch(playerStatsError => {
          console.error('Player Stats Error:', playerStatsError);
        });
    });
})