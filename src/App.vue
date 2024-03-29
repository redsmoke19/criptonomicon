<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div
      v-if="loader"
      class="fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center"
    >
      <svg
        class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
    <div class="container">
      <app-ticker
        @add-ticker="add"
        :disabled="tooManyTickersAdded"
        :tickers="tickers"
      />
      <template v-if="tickers.length > 0">
        <hr class="w-full border-t border-gray-600 my-4" />
        <div class="filter-inner flex items-center justify-between">
          <div class="filter">
            <span class="mr-2">Фильтр:</span>
            <input type="text" v-model="filter" />
          </div>
          <div class="pagination flex">
            <button
              @click="page -= 1"
              :disabled="page <= 1"
              type="button"
              class="my-4 mr-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Назад
            </button>
            <button
              @click="page = page + 1"
              type="button"
              :disabled="hasNextPage === false"
              class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Вперед
            </button>
          </div>
        </div>
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <!-- Полей :key должно быть уникальным, мы ведь не хотим что бы нашим ключом еще кто то воспользоваться -->
          <!-- Во vue больше для классов используется синтаксис объекта. И читается это так, ключ объекта это как, который нужно добавить, а значение это условие, при котором класс будет добавляться -->
          <div
            v-for="item in paginatedTickers"
            :key="item.name"
            @click="select(item)"
            :class="{
              'border-4': selectedTicker === item,
            }"
            class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ item.name }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatPrice(item.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.stop="handleDelete(item)"
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              Удалить
            </button>
          </div>
        </dl>
      </template>
      <template v-if="selectedTicker">
        <hr class="w-full border-t border-gray-600 my-4" />
        <section class="relative">
          <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
            {{ selectedTicker.name }} - USD
          </h3>
          <div
            ref="graph"
            class="flex items-end border-gray-600 border-b border-l h-64"
          >
            <div
              v-for="(bar, idx) in normalizedGraph"
              :key="idx"
              :style="{ height: `${bar}%` }"
              class="bg-purple-800 border w-10"
            ></div>
          </div>
          <button
            @click="selectedTicker = null"
            type="button"
            class="absolute top-0 right-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              xmlns:svgjs="http://svgjs.com/svgjs"
              version="1.1"
              width="30"
              height="30"
              x="0"
              y="0"
              viewBox="0 0 511.76 511.76"
              style="enable-background: new 0 0 512 512"
              xml:space="preserve"
            >
              <g>
                <path
                  d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                  fill="#718096"
                  data-original="#000000"
                ></path>
              </g>
            </svg>
          </button>
        </section>
      </template>
    </div>
  </div>
</template>

<script>
import { subscribeToTicker, unsubscribeFromTicker } from "@/api";
import AppTicker from "@/components/AppTicker.vue";

export default {
  name: "App",

  components: {
    AppTicker,
  },

  data() {
    return {
      filter: "",

      tickers: [],
      graph: [],
      maxGraphElements: 1,

      selectedTicker: null,

      loader: true,

      page: 1,
    };
  },

  created() {
    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );

    // Альтернативный вариант записи условий
    const VALID_KEYS = ["filter", "page"];

    VALID_KEYS.forEach((key) => {
      if (windowData[key]) {
        this[key] = windowData[key];
      }
    });

    // if (windowData.filter) {
    //   this.filter = windowData.filter;
    // }
    //
    // if (windowData.page) {
    //   this.page = Number(windowData.page);
    // }

    const tickersData = localStorage.getItem("criptonomicon-list");

    if (tickersData) {
      this.tickers = JSON.parse(tickersData);
      this.tickers.forEach((ticker) => {
        subscribeToTicker(ticker.name, (newPrice) => {
          this.updateTicker(ticker.name, newPrice);
        });
      });
    }
  },

  mounted() {
    window.addEventListener("resize", this.calculateMaxGraphElements);
    this.loader = false;
  },

  beforeMount() {
    window.removeEventListener("resize", this.calculateMaxGraphElements);
  },

  computed: {
    tooManyTickersAdded() {
      return this.tickers.length > 4;
    },

    startIndex() {
      return (this.page - 1) * 6;
    },

    endIndex() {
      return this.page * 6;
    },

    filteredTickers() {
      return this.tickers.filter((item) =>
        item.name.includes(this.filter.toUpperCase())
      );
    },

    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },

    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },

    normalizedGraph() {
      const minValue = Math.min(...this.graph);
      const maxValue = Math.max(...this.graph);

      if (minValue === maxValue) {
        return this.graph.map(() => 5); // вернуть массив равных значений
      }
      // На первый кругах интервала значение minValue и maxValue равны, из-за чего в знаменателе в формуле равно 0,
      // а на 0 делить нельзя, поэтому там NaN. Тут обязательно нужна разница в значениях
      return this.graph.map((price) => {
        return 5 + ((price - minValue) * 95) / (maxValue - minValue);
      });
    },

    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page,
      };
    },
  },

  methods: {
    calculateMaxGraphElements() {
      if (!this.$refs.graph) {
        return;
      }
      this.maxGraphElements = this.$refs.graph.clientWidth / 38;
    },

    updateTicker(tickerName, price) {
      this.tickers
        .filter((ticker) => ticker.name === tickerName)
        .forEach((ticker) => {
          if (ticker === this.selectedTicker) {
            this.graph.push(price);
            while (this.graph.length > this.maxGraphElements) {
              this.graph.shift();
            }
          }
          ticker.price = price;
        });
    },

    formatPrice(price) {
      if (price === "-") {
        return price;
      }
      return price > 1 ? price.toFixed(2) : price.toPrecision(2);
    },

    add(ticker) {
      const currentTicker = { name: ticker.toUpperCase(), price: "-" };

      // Todo сделать
      // this.isAdded = this.tickers.some(
      //   (item) => item.name === currentTicker.name
      // );
      // if (this.isAdded) {
      //   return;
      // }

      // Такой способ нужен для того что бы наш массив обновится
      // и сработал watch на массиве tickers
      // this.tickers.push(currentTicker);
      this.tickers = [...this.tickers, currentTicker];

      this.filter = "";
      subscribeToTicker(currentTicker.name, (newPrice) => {
        this.updateTicker(currentTicker.name, newPrice);
      });
    },

    select(ticket) {
      this.selectedTicker = ticket;
    },

    handleDelete(tickerToRemove) {
      this.tickers = this.tickers.filter((item) => item !== tickerToRemove);
      // Обновляем localStorage
      // Это старый код. Теперь из-за того что мы сделали для tickers watch
      // у нас локал сторадж автоматически сам обновляется
      // localStorage.setItem("criptonomicon-list", JSON.stringify(this.tickers));

      // Когда у нас показан график тикера и мы этот тикер удаляем,
      // то для того, что бы убрать график нужно следующий код
      if (this.selectedTicker === tickerToRemove) {
        this.selectedTicker = null;
      }

      unsubscribeFromTicker(tickerToRemove.name);
    },
  },

  watch: {
    tickers() {
      localStorage.setItem("criptonomicon-list", JSON.stringify(this.tickers));
    },

    selectedTicker() {
      this.graph = [];
    },

    paginatedTickers() {
      // Если мы на страницы удалили все элементы, то у нас появится пустая страница,
      // что бы этого не было мы должны проверить что если массив пустой и у нас страниц больше чем одна,
      // то мы должны вернуться на страницу назад
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },

    filter() {
      this.page = 1;
    },

    pageStateOptions(value) {
      console.log(value);
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${value.filter}&page=${value.page}`
      );
    },
  },
};
</script>
