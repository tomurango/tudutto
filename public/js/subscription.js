//どうやら、async function で 非同期関数の定義になるらしい
async function getCustomClaimRole() {
  await firebase.auth().currentUser.getIdToken(true);
  const decodedToken = await firebase.auth().currentUser.getIdTokenResult();
  //console.log("token", decodedToken);
  //console.log("stripe", decodedToken.claims.stripeRole);
  //console.log("firebase", decodedToken.claims.firebaseRole);
  if(decodedToken.claims.stripeRole){
    //課金ユーザ
    define('userplan','continue');
    document.getElementById("user_role_display").textContent = "メンバープラン";
    //subscriptionのsubmitボタンをとりあえずdisactiveにする
    //document.getElementById("subscsubmit").disabled = true;
    //と思ってたけど、表示するボタンをこれによって変更するのがいいと思うので
    //非課金にするためのボタンを表示
    //document.getElementById("notsubscsubmit").style.display = "flex";実験のために除外
    //20210603課金ユーザなので、広告管理のdiv(カード)を表示
    document.getElementById("chart_three").style.display = "flex";
  }else{
    //ヒカキンユーザ
    define('userplan','normal');
    document.getElementById("user_role_display").textContent = "ノーマルプラン";
    //課金をするためのボタンを表示
    //document.getElementById("subscsubmit").style.display = "flex";実験のために除外
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
//20201003小django教室だった日だね

//20201005これは昨日の記憶がないけど、たしかタスク完了後の画面遷移とかした忘れた
//20201007昨日の記録がないけど、確かcloudfunctionのエラーを対応したはず。今日は日記だね。task およびスタンプがしっかり動いてくれてない問題派は今も健在よ
//20201008今日は愉しいな。なんもしてないで
//20201009tuduttoよりもjobnicationの優先度を上げました。おそらく年末年始までこれは止まらないし止めるつもりもない
//20201010CCCのCodeByRayのスライドの全体的な構成を含めた形で書き起こしましたよー
//20201011今日もcloudfunctiontask false 動いてなかったよ 三回再実行してようやく動いたから、ひどい対策かもだけど、それで対応は取れるかも
//20201012今日はcloudfunction内でタスクに関してconsoleを目指したかなー
//20201013今日はスライドだったかなぁ
//20201014実習の残り二人といろいろ話したなぁ。楽しかったよ。ありがとう。 
//あしたは今の関数の動きを確認したのちにデプロイしてさらに日をおいて確認しましょう。
//それから読み取り書き込みオペレーション（Promiseでの非同期処理）をリンク参考に実装してデプロイして確認しよう！

//確認取れたよ動いてる！ただ、18時から活動する約束は守れてないからそこでの再検討が必要かなｗ
//あしたは18:00から確実に時間を確保せよ
//20201018cloudfunctionのuncheckTaskはpromise仕込みで記述しdeployしたから、動きを明日確認しましょうか。

//20201019非同期関数ログは見てないけど、結果としてはちゃんと動いてくれてるyeah!
//20201020CCC完全優先期間となっている現在でございます。そしてそれでいいのです。
//20201021CCC完全優先機関だよー。今日も作業なし。
//20201022CCC完全優先期間。日記はええなぁって思うんです。
//20201023ラチェクラの動画見ただけの一日だな
//20201024自作業完全非コントロール性によるストレスかな？つらい日だったなｗ
//20201025日曜日は思い付きの日になります。のでcccの余韻に浸りつつ、学びと今日の夜に書く記事の事をかみしめてる。明日はcloud functionの非同期化の推進をするかな
//20201026cloudfunctionのpromise実施は完了いたした。次は最初の画面のチュートリアルの画像を作ることからスタート
//20201027ロゴ優先に切り替えの日ですね。対応が必要です。

//20201102今日は何もしていないが、一日1予定だけにしなきゃだめだ。他の作業がままならなくなる。明日から1800再開だわ
//20201103やったけど5分前は確実に守れ。必要だ。

//20201104時間は守ったけど、寝落ちだねｗ
//20201106今日は作業やったぜ、ナイス！次はfaviconやって、メッセージイラストの色変え作業かな
//20201107画像周りを整える作業を完了した。taskcreatemanを作るのが明日だね

//20201110日記には書かなくなったけど、修正とか手を加えることができている。明日は、タスクがない時のdivを作り上げていく方針で行こう
//20201111とりあえず、task作れの表示にはなったね。全体のデザインもちまちま整えといた。明日は、何をやるかを決めるところから。

//20201118今日は寝不足分寝てた気がする。講義がある期間は、ブランドとかロゴに対する問題に関してかな。

//20201124ヤルキーパー命名「北尾拓也」感謝の意を申し上げたい。チームのメリットはこれかも。俺一人だと、出てないよこれ。
//20201125水今日は進めれてないね。サービス名は少しずつは考えてるかな。できるとしたら、ヤルキーパーの場合のロゴを考えることだね。


//20201205ツヅクエストのロゴを明日は行う。今日は恋愛反省会が一番楽しい
//20201206小川meetを言い訳にしてるけど、ギターとかピアノとか楽しんでるから、そこも問題かも

//20201209ゆーまの家でロゴの精密作成全部出力して完了かな

//buttonのエフェクト
const buttonRipple = new mdc.ripple.MDCRipple(document.querySelector('.mdc-button'));

function subscription_detail(){
  document.getElementById("div_for_subscription").style.display = "block";
}

function subscription_detail_back(){
  document.getElementById("div_for_subscription").style.display = "none";
}

function stripe_detail(){
  document.getElementById("div_for_stripe").style.display = "block";
}

function stripe_detail_back(){
  document.getElementById("div_for_stripe").style.display = "none";
}

//20210603備忘録プラン変更の関数（サブすくの解約）の実装をしましょう