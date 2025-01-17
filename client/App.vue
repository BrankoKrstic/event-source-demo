<template>
    <v-app>
        <v-main class="d-flex align-center justify-center" style="min-height: 300px;">
          
            
            <v-container max-width="800">
                <v-form @submit.prevent="handleSubmit">
                    <v-row>
                        <v-col>
                            <v-text-field v-model="newItem" label="Write Something" variant="solo-filled"></v-text-field>
                        </v-col>
                        <v-col cols="5" md="4">
                            <v-btn rounded="lg" size="x-large" block type="submit">Submit</v-btn>
                        </v-col>
                    </v-row>
                </v-form>
                <v-row class="overflow-x-auto flex-nowrap">
                    <v-col v-for="event in events" :key="event.id" cols="6" md="3">
                        <v-card
                            :color="event.active ? 'primary' : 'secondary'"
                            variant="elevated"
                            class="mx-auto"
                        >
                            <v-card-item height="100px">
                                <div>
                                    <div class="text-overline mb-1">
                                        {{ event.active ? 'Active' : 'Inactive' }}
                                    </div>
                                    <div class="text-h6 mb-1">
                                        {{ event.ty }} Event
                                    </div>
                                    <div class="mb-1">
                                        Date: {{ new Date(event.ts).toLocaleDateString() }}
                                    </div>
                                </div>
                            </v-card-item>

                            <v-card-actions>
                                <v-btn @click="handleRewind(event.id)">
                                    Rewind Event
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <p class="text-medium-emphasis text-center"><em>Rewinding an event restores the state right before the event was applied</em></p>
                    </v-col>
                </v-row>
                <v-row class="overflow-x-auto" style="height: 300px;">
                    <v-sheet width="100%">
                        <v-list lines="one">
                            <v-list-item
                                v-for="item in items"
                                :key="item.id || item.content"
                                color="primary"
                                variant="plain"
                                :title="item.content"
                            >
                                <template v-if="item.id != null" v-slot:append>
                                    <v-icon  
                                        class="cursor-pointer"
                                        @click="deleteItem(item.id)"
                                        icon="mdi-close">
                                    </v-icon>
                                </template>
                            </v-list-item>
                        </v-list>
                    </v-sheet>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <p class="text-medium-emphasis text-center"><em>Tip: Try opening the page in a second browser window and changing something</em></p>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>
    </v-app>
</template>

<script lang="ts" setup>
import axios from 'axios';
import { ref, shallowRef, onMounted } from 'vue';
const events = shallowRef<{ id: string, ty: string, active: boolean, ts: number }[]>([]);
const error = ref(false);
const loading = ref(true);
const items = shallowRef<{ id: string | null, content: string }[]>([]);
const newItem = ref('');

const source = ref<EventSource | null>(null);
const connectEventStream = () => {
    if (source.value) {
        source.value.close();
    }

    source.value = new EventSource('/sse/ledger');
    source.value.addEventListener('message', (e) => {
        loading.value = false;
        const data = JSON.parse(e.data);
        items.value = data.ledgerItems;
        events.value = data.eventState;
    });

    source.value.addEventListener('error', (e) => {
        console.error('Something went wrong', e);
        error.value = true;
    });
};

window.addEventListener('unload', () => {
    source.value?.close();
    source.value = null;
});
const handleSubmit = () => {
    const content = newItem.value;
    items.value = [...items.value, { id: null, content }];
    newItem.value = '';
    axios.post('/api/ledger', { content }).catch(() => {
        items.value = items.value.filter((i) => i.id != null);
    });
};

onMounted(connectEventStream);

const deleteItem = (id: string) => {
    axios.delete(`/api/ledger/${id}`).catch(() => {});
};

const handleRewind = (id: string) => {
    axios.post(`/api/ledger/rewind/${id}`).catch(() => {});
};
</script>
