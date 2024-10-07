module.exports = {
    name: "advisor",

    settings: {},

    actions: {

        async forecast(ctx) {
            if( (await ctx.call("auth.isAuthenticated")).authenticated )  {
                    return (await axios.get("https://api.corrently.io/v2.0/gsi/advisor?lat=49.3846535&lon=8.796351")).data
            }
        }

    }

}
