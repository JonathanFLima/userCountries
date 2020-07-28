let globalUsers = [];
let globalCountries = [];
let globalUserCountries = [];
let globalFilteredUserCountries = [];

async function start() {
  // await fetchUsers();
  // await fetchCountries();

  console.time('time');
  //await promiseUsers();
  //await promiseCountries();

  await Promise.all([promiseUsers(), promiseCountries()]);
  console.timeEnd('time');

  hideSpinner();
  mergeUsersAndCountries();

  setupFilter();
  render();
}

function promiseUsers() {
  return new Promise(async (resolve, reject) => {
    await fetchUsers();

    setTimeout(() => {
      console.log('promiseUsers: resolvida');
      resolve();
    }, 3000);
  });
}

function promiseCountries() {
  return new Promise(async (resolve, reject) => {
    await fetchCountries();

    setTimeout(() => {
      console.log('promiseCountries: resolvida');
      resolve();
    }, 4000);
  });
}

async function fetchUsers() {
  const response = await fetch('http://localhost:3002/users');
  const json = await response.json();

  globalUsers = json.map(({ login, nat, name, picture }) => {
    return {
      userId: login.uuid,
      userCountry: nat,
      userName: name.first,
      userPicture: picture.large,
    };
  });
}

async function fetchCountries() {
  const response = await fetch('http://localhost:3001/countries');
  const json = await response.json();

  globalCountries = json.map(({ alpha2Code, flag, name }) => {
    return {
      countryId: alpha2Code,
      countryFlag: flag,
      countryName: name,
    };
  });
}

function hideSpinner() {
  document.querySelector('#spinner').classList.add('hide');
}

function mergeUsersAndCountries() {
  globalUserCountries = [];

  globalUsers.forEach((user) => {
    const userCountry = globalCountries.find((country) => {
      return country.countryId === user.userCountry;
    });

    globalUserCountries.push({
      ...user,
      userNameLowerCase: user.userName.toLowerCase(),
      countryName: userCountry.countryName,
      countryFlag: userCountry.countryFlag,
    });
  });

  globalUserCountries.sort((a, b) => a.userName.localeCompare(b.userName));
  globalFilteredUserCountries = [...globalUserCountries];
}

function render() {
  const divUsers = document.querySelector('#divUsers');

  divUsers.innerHTML = `
    <div class="row">
      ${globalFilteredUserCountries
        .map((item) => {
          return `
          <div class="col s6 m4 l3">
            <div class="flex-row bordered">
              <img class="avatar" src="${item.userPicture}" alt="${item.userName}" />
              <div class="flex-column">
                <span>${item.userName}</span>
                <img class="flag" src="${item.countryFlag}" alt="${item.countryName}" />
            </div>
          </div>
        </div>
        `;
        })
        .join('')}
    </div>
  `;
}

function setupFilter() {
  const buttonFilter = document.querySelector('#buttonFilter');
  const inputFilter = document.querySelector('#inputFilter');

  buttonFilter.addEventListener('click', () => {
    const filterValue = inputFilter.value.toLowerCase();
    filterUsersAndCountries(filterValue);
  });

  inputFilter.addEventListener('keyup', (event) => {
    const { key } = event;
    const { value } = event.target;

    //código comentado caso queira deixar "dinâmico"
    /* if (key !== 'Enter') {
      return;
    }*/

    filterUsersAndCountries(value);
  });
}

function filterUsersAndCountries(filterValue) {
  globalFilteredUserCountries = globalUserCountries.filter(
    ({ userNameLowerCase }) => {
      return userNameLowerCase.includes(filterValue);
    }
  );

  render();
}

start();
