//どうやら、async function で 非同期関数の定義になるらしい
async function getCustomClaimRole() {
  await firebase.auth().currentUser.getIdToken(true);
  const decodedToken = await firebase.auth().currentUser.getIdTokenResult();
  if(decodedToken.claims.stripeRole){
    //課金ユーザ
    define('userplan','continue');
    document.getElementById("user_role_display").textContent = "コンティニュープラン";
  }else{
    //ヒカキンユーザ
    define('userplan','normal');
    document.getElementById("user_role_display").textContent = "ノーマルプラン";
  }
  return decodedToken.claims.stripeRole;
}

var use_terms_dialog = new mdc.dialog.MDCDialog(document.querySelector('#use_terms_dialog'));
use_terms_dialog.scrimClickAction = "";

/* git hub のサンプルを見て、firebase console の表記も見てある程度最低限で動きそうな型にまとめたかな */
async function subscribe(){
  /*
    const docRef = await db.collection('customers').doc(global_user.uid).collection('checkout_sessions')
    .add({
        price: 'price_1GqIC8HYgolSBA35zoTTN2Zl',
        success_url: window.location.origin,
        cancel_url: window.location.origin,
    });
    // Wait for the CheckoutSession to get attached by the extension
    docRef.onSnapshot((snap) => {
        const { sessionId } = snap.data();
        if (sessionId) {
            // We have a session, let's redirect to Checkout
            // Init Stripe
            const stripe = Stripe('pk_test_1234');
            stripe.redirectToCheckout({ sessionId });
        }
    });
  */
  

  const docRef = await db.collection('customers').doc(global_user.uid).collection('checkout_sessions')
  .add({
    price: 'price_1HKzPuK4amKkUSI0bSTJNsb4',
    success_url: window.location.origin,
    cancel_url: window.location.origin,
  });
  // Wait for the CheckoutSession to get attached by the extension
  docRef.onSnapshot((snap) => {
    const { error, sessionId } = snap.data();
    if (error) {
      // Show an error to your customer and 
      // inspect your Cloud Function logs in the Firebase console.
      alert(`An error occured: ${error.message}`);
    }
    if (sessionId) {
      // We have a session, let's redirect to Checkout
      // Init Stripe
      var stripe = Stripe('pk_test_51HJd7bK4amKkUSI0v1KwlONpt66eSdYQp054Goeveigjshls9m0zU63pLVnmXFR7cYZZvKqFxFW9E8APQFLTr2Ci005Wzw2ajd');
      stripe.redirectToCheckout({ sessionId });
    }
  });
} 

/* とりあえず商品をとってくる関数として機能していると認識しております。 */
function list_products(){
    db.collection('products')
  .where('active', '==', true)
  .get()
  .then(function (querySnapshot) {
    querySnapshot.forEach(async function (doc) {
      console.log(doc.id, ' => ', doc.data());
      const priceSnap = await doc.ref.collection('prices').get();
      priceSnap.docs.forEach((doc) => {
        console.log(doc.id, ' => ', doc.data());
      });
    });
  });
}

//次やる作業は、商品を試しにとってきて、そのUIを検討すること
//20200911今日はなんもしてないね
//20200912今日も集中作業はなし、ひとまず先送り状態ではある
//20200913今日もやってない、こるぅうぅれぇは計画など設立をする必要があると考えてよろしいかと
//20200914今日もやってない16日になったら時が来る。土日は優先で作業くむことになるかもしれません
//20200915今日はルービックキューブの6X6X6がそろいました！

//20200917昨日は進めたね、明日はそれに関するUIを進めるかな、ちな今日は初仕事
//20200918 check out settion の挙動確認が取れた。販促とプランの表示、内容を固めよう
//20200919今日は起床耐久のため作業はなし。課金誘導UIはHabitatかyoutubeの参考になるかなぁ
//20200920今日は小説読み漁りでっすー
//20200921今日は講義が始まりやしたねー 二つ目のロゴの提案をしたひでっせ
//20200922今日はこの後スライドの発表の用意をいたす時間でござるな
//20200923作業は土日になるから平日は基本日記やねｗ今日はスライドの発表がござったよ
//20200924今日は絵を描いたね、作業挫折中断等の切替先の検討をするべき感。おそらくtodolistに帰ってくるね
//20200925今日はだらだら？なーなー？をやめようかという画策が発生した日。コップとフェニックス
//20200926土曜だったがロゴとCodeByRayに引っ張られて開発せんかったよん

//20200928つづっとの新たなるロゴの挑戦かなまあ今週も講義が始まるから、ねぇあんまりやれないかもねぇ
//20200929つぎやるべきこととかも決めんとなぁロゴの後は課金とヒカキンの昨日ちゃんと決める必要がある
//20200930cloudfunctionに障害かな？いつか対応の必要が出るかもしれん
//20201001function deploy し直したけど、結果をまとう明日の➡関数を再実行二回くらいやったら動いてくれた謎
//20201002再稼働しっかりしとりますねぇ、、、
//20201003小川django教室だった日だね

//buttonのエフェクト
const buttonRipple = new mdc.ripple.MDCRipple(document.querySelector('.mdc-button'));

function subscription_detail(){
  document.getElementById("div_for_subscription").style.display = "block";
}

function subscription_detail_back(){
  document.getElementById("div_for_subscription").style.display = "none";
}