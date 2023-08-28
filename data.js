const headers = {
    'Accept': 'application/json'
  };
  
  fetch('https://api.estfor.com/global-user-stats', {
    method: 'GET',
    headers: headers
  })
  .then(function(res) {
    if (!res.ok) {
      throw new Error('Network response was not ok');
    }
    return res.json();
  })
  .then(function(userStatsResponse) {
    console.log('User Stats API Response:', userStatsResponse);
  
    const globalUserStats = userStatsResponse.globalUserStats;
  
    const totalUsers = parseFloat(globalUserStats.totalUsers);
    const totalSoldWei = parseFloat(globalUserStats.totalSold);
    const totalBoughtWei = parseFloat(globalUserStats.totalBought);
    const totalBrushBurnedWei = parseFloat(globalUserStats.totalBrushBurned);
  
    const totalSoldEther = totalSoldWei / Math.pow(10, 18);
    const totalBoughtEther = totalBoughtWei / Math.pow(10, 18);
    const totalBrushBurnedEther = totalBrushBurnedWei / Math.pow(10, 18);
    
  
    const averageSoldEther = totalSoldEther / totalUsers;
    const averageBoughtEther = totalBoughtEther / totalUsers;
    const revenuePerUserEther = totalBrushBurnedEther / totalUsers;
    fetch('https://api.estfor.com/global-donation-stats', {
      method: 'GET',
      headers: headers
    })
    .then(function(donationRes) {
      if (!donationRes.ok) {
        throw new Error('Network response was not ok');
      }
      return donationRes.json();
    })
    .then(function(donationResponse) {
      console.log('Donation Stats API Response:', donationResponse);
  
      const globalDonationStats = donationResponse.globalDonationStats;
  
      const totalDonatedWei = parseFloat(globalDonationStats.totalDonatedAmount);
      const totalDonatedEther = totalDonatedWei / Math.pow(10, 18);
      const totalDonatedEtherNoFF = totalDonatedEther - 354000;
  
      const numUsersDonated = parseFloat(globalDonationStats.numUsersDonated);
      const numUsersDonatedNoFF = numUsersDonated - 1;
  
      // Check for division by zero
      const totalDonatedPerUserEther = numUsersDonated !== 0 ? totalDonatedEther / numUsersDonated : 0;
      const totalDonatedPerUserEtherNoFF = numUsersDonatedNoFF !== 0 ? totalDonatedEtherNoFF / numUsersDonatedNoFF : 0;


      // Fetch BRUSH price from CoinGecko
        fetch('https://api.coingecko.com/api/v3/simple/price?ids=paint-swap&vs_currencies=usd', {
            method: 'GET',
            headers: headers
        })
        .then(function(priceRes) {
            if (!priceRes.ok) {
            throw new Error('BRUSH price fetch failed');
            }
            return priceRes.json();
        })
        .then(function(priceResponse) {
            console.log('Price Response:', priceResponse);

            const brushPriceUSD = priceResponse['paint-swap'] ? priceResponse['paint-swap'].usd : 'N/A';
            const revenuePerUserUSD = revenuePerUserEther * brushPriceUSD;

            const totalGeneratedUsd = totalBrushBurnedEther * brushPriceUSD;
  
      const resultContainer = document.getElementById('result-container');
      resultContainer.innerHTML = `
        <p><span class="title">Total Users:</span> ${totalUsers.toLocaleString()}</p>
        <p><span class="title">Total Sold:</span> ${totalSoldEther.toLocaleString()} BRUSH</p>
        <p><span class="title">Total Bought:</span> ${totalBoughtEther.toLocaleString()} BRUSH</p>
        <p><span class="title">Average Sold per User:</span> ${averageSoldEther.toLocaleString()} BRUSH</p>
        <p><span class="title">Average Bought per User:</span> ${averageBoughtEther.toLocaleString()} BRUSH</p>
        <p><span class="title">Total Donated:</span> ${totalDonatedEther.toLocaleString()} BRUSH</p>
        <p><span class="title">Number of Users Donated:</span> ${numUsersDonated.toLocaleString()}</p>
        <p><span class="title">Average Donated per User:</span> ${totalDonatedPerUserEther.toLocaleString()} BRUSH</p>
        <p><span class="title">Average Donated per User minus FF:</span> ${totalDonatedPerUserEtherNoFF.toLocaleString()} BRUSH</p>
        <p><span class="title">Revenue per User:</span> ${revenuePerUserEther.toLocaleString()} BRUSH</p>
        <p><span class="title">Revenue per User USD:</span> $${revenuePerUserUSD.toLocaleString()}</p>
        <p><span class="title">Revenue generated USD:</span> $${totalGeneratedUsd.toLocaleString()}</p>
      `;
      
    })
    .catch(function(priceError) {
        console.error('BRUSH Price Fetch Error:', priceError);
      })
    .catch(function(donationError) {
      console.error('Donation Stats Error:', donationError);
    });
  })
  .catch(function(userStatsError) {
    console.error('User Stats Error:', userStatsError);
  });
})