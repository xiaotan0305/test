const log = console.log;
const isArray = (arr) => {
  return Object.prototype.toString.call(arr) === "[object Array]";
};

window.mylocation = {
  key: "aa14c0bc0874a9e68f81355b17eb6e5c",
  options: {},
  getLocationFrom: "geo",
  geo: {},
  /**
   * 获取位置信息
   */
  getLocation(params = {}) {
    return this.geoFindMe(params).then((res = {}) => {
      const { code, data } = res;
      if (code === 1) {
        this.geo = data;
        this.getLocationFrom = "geo";
        return this.getLocationByGeo(data, params);
      }
      this.getLocationFrom = "ip";
      return this.getLocationByIp(params);
    });
  },

  /**
   * 获取经纬度
   */
  geoFindMe(params) {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({
          code: -1,
          message: "Your browser does not support geolocation",
        });
        return;
      }
      // 成功回调
      const successFn = (pos = {}) => {
        const { coords = {} } = pos;
        const { latitude, longitude } = coords;
        log("定位成功", coords);
        resolve({
          code: 1,
          data: {
            lat: latitude,
            lon: longitude,
          },
        });
      };
      // 失败回调
      const failFn = (err) => {
        log("定位失败", err);
        reject({
          code: -1,
          message: err.message,
        });
      };
      // 定位参数
      const options = {
        // 定位超时时间
        timeout: params.timeout || 10000,
      };
      navigator.geolocation.getCurrentPosition(successFn, failFn, options);
    });
  },

  /**
   * 通过经纬度获取位置信息
   */
  getLocationByGeo(geo = {}, params = {}) {
    const { lat, lon } = geo;
    const location = `${lon},${lat}`;
    const options = {
      method: "GET",
      url: "https://restapi.amap.com/v3/geocode/regeo",
      params: {
        key: this.key,
        location,
        output: "JSON",
        radius: "1000",
        extensions: "all",
      },
      // withCredentials: true,
      timeout: params.timeout || 0,
    };
    return axios(options).then((res) => {
      const { data } = res;
      const { regeocode } = data || {};
      const formattedAddress = regeocode.formatted_address || "";
      const address = regeocode.addressComponent || {};
      const { lat, lon } = this.geo;
      const streetNumber = address.streetNumber || {};
      const neighborhood = address.neighborhood || {};
      const aoisArr = regeocode.aois || [];
      const aois = aoisArr[0] || {};
      const neighborhoodName =
        (isArray(neighborhood.name)
          ? neighborhood.name[0]
          : neighborhood.name) || "";
      const result = {
        lat, // 维度
        lon, // 经度
        country: address.country || "", // 国家
        province: address.province || "", // 省份
        city: address.city || "", // 城市
        area: address.district || "", // 区域
        township: address.township || "", // 乡镇
        street: streetNumber.street || "", // 街道
        streetNum: streetNumber.number || "", // 街道号
        neighborhoodName, // 社区
        number: "", // 门牌号
        aoi: aois.name || "", // 兴趣点
        formattedAddress, // 详细地址
        citycode: address.citycode || "", // 城市编码
        areacode: address.adcode || "", // 区域编码
        towncode: address.towncode || "", // 乡镇编码
      };
      return result;
    });
  },

  /**
   * 通过ip获取位置信息
   */
  getLocationByIp(params) {
    const options = {
      method: "GET",
      url: "https://restapi.amap.com/v3/ip",
      params: {
        key: this.key,
        output: "JSON",
      },
      // withCredentials: true,
      timeout: params.timeout || 0,
    };
    return axios(options).then((res) => {
      const { data } = res;
      const rectangle = data.rectangle || "";
      const lonLat = rectangle.split(";")[0] || "";
      const { lon = "", lat = "" } = lonLat.split(",");
      const result = {
        lat, // 维度
        lon, // 经度
        country: "", // 国家
        province: data.province || "", // 省份
        city: data.city || "", // 城市
        area: data.district || "", // 区域
        township: "", // 乡镇
        street: "", // 街道
        streetNum: "", // 街道号
        neighborhoodName: "", // 社区
        number: "", // 门牌号
        aoi: "", // 兴趣点
        formattedAddress: "", // 详细地址
        citycode: data.adcode || "", // 城市编码
        areacode: "", // 区域编码
        towncode: "", // 乡镇编码
      };
      return result;
    });
  },
};
