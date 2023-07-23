<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Тикер</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <!-- v-model говорит нам "связи в две стороны данный инпут с данными -->
          <input
            v-model="ticker"
            @keydown.enter="add"
            @input="print"
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
          />
        </div>
        <div
          v-if="tickersPlaceholders.length"
          class="flex bg-white shadow-md p-1 rounded-md flex-wrap"
        >
          <span
            v-for="(tickItem, idx) in tickersPlaceholders"
            :key="idx"
            @click="placeholderHandler(tickItem)"
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            {{ tickItem }}
          </span>
        </div>
        <div v-if="isAdded" class="text-sm text-red-600">
          Такой тикер уже добавлен
        </div>
      </div>
    </div>
    <app-button @click="add" type="button" :disabled="disabled" class="my-4" />
  </section>
</template>

<script>
import AppButton from "@/components/AppButton.vue";
export default {
  name: "AppTicker",
  components: { AppButton },

  props: {
    disabled: {
      type: Boolean,
      required: false,
      disabled: false,
    },
    tickers: {
      type: Array,
      default: () => Array,
    },
  },

  emits: {
    "add-ticker": (value) => {
      return typeof value === "string" && value.length > 0;
    },
  },

  data() {
    return {
      ticker: "",
      coinsNames: null,
      isAdded: false,
      tickersPlaceholders: [],
    };
  },

  created() {
    const loadCoinData = async () => {
      const response = await fetch(
        "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
      );
      const data = await response.json();
      this.coinsNames = Object.entries(data.Data);
    };
    loadCoinData();
  },

  methods: {
    add() {
      this.isAdded = this.tickers.some(
        (item) => item.name === this.ticker.toUpperCase()
      );

      if (this.ticker.length === 0 || this.isAdded || this.disabled) {
        return;
      }

      this.$emit("add-ticker", this.ticker);
      this.ticker = "";
      this.tickersPlaceholders = [];
    },

    print() {
      this.isAdded = false;
      const filtered = this.coinsNames
        .filter((item) => item[0].indexOf(this.ticker.toUpperCase()) === 0)
        .map((item) => item[0]);
      this.tickersPlaceholders = filtered.slice(0, 4);
    },

    placeholderHandler(tickItem) {
      this.ticker = tickItem;
      this.add();
    },
  },
};
</script>
