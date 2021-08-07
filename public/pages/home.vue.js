const Home = {
    data() {
        return {
            room_name: '',
            user_name: ''
        }
    },

    mounted() {
        if(typeof(this.$route.params.room) == 'undefined')
            this.room_name = Math.random().toString(36).slice(7)
        else
            this.room_name = this.$route.params.room
    },

    methods:{
        onSubmit() {
            var redirect = '/room/' + this.room_name
            router.push({ path: redirect, query: { user: this.user_name } })
        }
    },
    template: `        
        <div id='home'>
            <h1>Frenly Park</h1>
            <p>Share the joy that music brings with the ones you love!</p>
            <form @submit.prevent="onSubmit">
                <input id='room-input' v-model="user_name" type="text" pattern="^[a-zA-Z0-9 ]{3,10}$" 
                    placeholder="Username" required>
                <button class='submitBtn' type="submit">Let's Go!</button>
            </form>

            <p id='footer'>Developed by- <a href='http://abhishek-almeida.ddns.net' target='_blank'>Abhishek Almeida</a></p>
        </div>
    `
}