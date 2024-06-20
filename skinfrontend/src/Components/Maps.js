const handleHospitalSearch = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Fetch hospitals using an external API
        try {
          const response = await fetch(`YOUR_API_URL?latitude=${latitude}&longitude=${longitude}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          
          const data = await response.json();
          const hospitals = data.results.slice(0, 5); // Get top 5 hospitals
  
          const date = new Date();
          const hour = date.getHours();
          const minute = date.getMinutes();
          const str_time = `${hour}:${minute < 10 ? '0' : ''}${minute}`;
  
          const botMessage = {
            text: `Top 5 Skin Care Hospitals Near You:\n${hospitals.map(hospital => hospital.name).join('\n')}`,
            time: str_time,
            sender: 'bot'
          };
  
          setMessages((prevMessages) => [...prevMessages, botMessage]);
        } catch (error) {
          console.error('There was an error fetching hospital data!', error);
        }
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };
  