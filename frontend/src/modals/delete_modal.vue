<template>
    <b-modal size="md" title="Are you sure you want to delete the selected rows?" v-model="isOpened" centered hide-footer>
        <div class="text-center">
            <button class="btn btn-secondary mr-3" @click="close()">Cancel</button>
            <button class="btn btn-danger mr-3" @click="trigger()">Ok</button>
        </div>
    </b-modal>
</template>

<script>
export default {
    data() {
        return {
            isOpened: false
        }
    },
    props: {
        deleterows: {
            type: Function,
            required: true
        }
    },
    methods: {
        open() {
            this.isOpened = true;
        },
        close() {
            this.isOpened = false;
        },
        trigger() {
            this.deleterows(); // Call the function to delete rows
            this.close(); // Close the modal after deleting rows
        }
    }
}
</script>
