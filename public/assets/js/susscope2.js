const API_BASE_URL = "http://localhost:3002"

const SusScope2 = {

    unauthPost: function(url,data) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: API_BASE_URL+url, 
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                success: function(response) {
                    resolve(response);
                },
                error: function(xhr) {
                    reject(JSON.parse(xhr.responseText).message);
                }
            });
        });
    },

    post: function(url,data) {

        return new Promise((resolve, reject) => {
            const token = localStorage.getItem("token");
            if((typeof token == 'undefined') || (token == null)) {
                reject("Token not available");
            }
            $.ajax({
                url:  API_BASE_URL + url,
                method: 'POST',
                data:JSON.stringify(data),
                contentType: 'application/json',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                success: function(response) {
                   resolve(response);
                },
                error: function(xhr, status, error) {
                    reject(xhr.responseText);
                }
            });
        });
    },
    get: function(url) {
        const token = localStorage.getItem("token");
        if((typeof token == 'undefined') || (token == null)) {
            throw Error("Token not available");
        }
        return new Promise((resolve, reject) => {
            $.ajax({
                url: API_BASE_URL + url,
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                success: function(response) {
                   resolve(response);
                },
                error: function(xhr, status, error) {
                    reject(error);
                }
            });
          });        
    },

    getTimeStamp: async function() {
        return await this.get("/api/timestamp");
    },

    addMeter: async function(data) {
        return await this.post("/api/asset/meter",data);
    },
    listMeters: async function() {
        return await this.get("/api/asset/meters");
    },
    advisor: async function(zip,meterid) {
        return await this.get("/api/data/advisor?zip="+zip+"&meterid="+meterid);
    },

    energyprice: async function(zip,meterid) {
        return await this.get("/api/data/energyprice?zip="+zip+"&meterid="+meterid);
    },
    gsi: async function(zip,meterid) {
        return await this.get("/api/data/gsi?zip="+zip+"&meterid="+meterid);
    }

}