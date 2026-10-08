import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CaretLeft, CaretRight, Check, Plus, Minus, Trash,
  TextAlignLeft, Wrench, MapPin, CurrencyNgn, CheckCircle, Calendar, Tag,
} from 'phosphor-react-native';
import { useTheme } from '../../context/ThemeContext';

const TOTAL_STEPS = 5;
const STEP_TITLES = ['Service Info', 'Pricing & Addons', 'Location', 'Availability', 'Submit'];
const SERVICE_CATEGORIES = [
  { id: 'beauty',   label: 'Beauty & Grooming',   icon: '💅' },
  { id: 'health',   label: 'Health & Wellness',   icon: '🏥' },
  { id: 'cleaning', label: 'Cleaning',            icon: '🧹' },
  { id: 'repairs',  label: 'Repairs & Handyman',  icon: '🔧' },
  { id: 'tutoring', label: 'Tutoring',            icon: '📚' },
  { id: 'fitness',  label: 'Fitness & Training',  icon: '💪' },
  { id: 'catering', label: 'Catering & Events',   icon: '🍽️' },
  { id: 'photo',    label: 'Photography & Video', icon: '📷' },
  { id: 'auto',     label: 'Auto & Mobility',     icon: '🚗' },
  { id: 'it',       label: 'IT & Tech Support',   icon: '💻' },
];
const PRICE_TYPES = [
  { key: 'fixed',    label: 'Fixed Price',  desc: 'One set price for the service.' },
  { key: 'from',     label: 'From Price',   desc: 'Starting from a minimum price.' },
  { key: 'per_hour', label: 'Per Hour',     desc: 'Charged by the hour.' },
];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const makeSchedule = () => Object.fromEntries(DAYS.map(d => [d, { enabled: !['Sat','Sun'].includes(d), open: '09:00', close: '18:00' }]));
const INIT = {
  category: null, name: '', images: [], description: '',
  duration: '60', priceType: 'fixed', price: '',
  addons: [{ name: '', price: '' }],
  locationType: null,
  schedule: makeSchedule(),
  concurrentLimit: '1',
};

export default function VendorAddServiceScreen({ navigation }) {
  const { colors } = useTheme();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INIT);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const scrollRef = useRef(null);
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setDay = (d, k, v) => upd('schedule', { ...form.schedule, [d]: { ...form.schedule[d], [k]: v } });

  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!form.category)           e.category    = 'Choose a category.';
      if (!form.name.trim())        e.name        = 'Service name is required.';
      if (!form.description.trim()) e.description = 'Description is required.';
      if (form.images.length === 0) e.images      = 'Add at least 1 image.';
    }
    if (step === 1 && !form.price)          e.price       = 'Enter a price.';
    if (step === 2 && !form.locationType)   e.locationType= 'Choose a location type.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => { if (!validate()) return; scrollRef.current?.scrollTo({y:0,animated:false}); step===4?doSubmit():setStep(s=>s+1); };
  const goBack = () => { if (step===0){navigation.goBack();return;} scrollRef.current?.scrollTo({y:0,animated:false}); setStep(s=>s-1); };
  const doSubmit = async () => { setSaving(true); await new Promise(r=>setTimeout(r,1500)); setSaving(false); setSubmitted(true); };

  const styles = getStyles(colors);

  const step0 = () => (
    <View>
      <Text style={styles.stepTitle}>Service Information</Text>
      <Text style={styles.stepSub}>Tell customers what you offer and why they should book you.</Text>
      <Text style={styles.fieldLabel}>Category *</Text>
      <View style={styles.catGrid}>
        {SERVICE_CATEGORIES.map(cat => {
          const active = form.category === cat.id;
          return (
            <TouchableOpacity key={cat.id} style={[styles.catChip, active&&{backgroundColor:colors.navy,borderColor:colors.navy}]}
              onPress={()=>{upd('category',cat.id);setErrors(p=>({...p,category:undefined}));}} activeOpacity={0.8}>
              <Text style={styles.catEmoji}>{cat.icon}</Text>
              <Text style={[styles.catTxt, active&&{color:'#fff'}]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {errors.category && <Text style={styles.err}>{errors.category}</Text>}
      <Text style={[styles.fieldLabel,{marginTop:16}]}>Service Name *</Text>
      <View style={[styles.inputRow, errors.name&&styles.inputErr]}>
        <Wrench size={18} color="#94A3B8" />
        <TextInput style={styles.textIn} value={form.name} onChangeText={v=>{upd('name',v);setErrors(p=>({...p,name:undefined}));}} placeholder="e.g. Full Body Massage · 60 min" placeholderTextColor="#A1A1AA" />
      </View>
      {errors.name && <Text style={styles.err}>{errors.name}</Text>}
      <Text style={[styles.fieldLabel,{marginTop:14}]}>Description *</Text>
      <View style={[styles.inputRow, styles.textareaRow, errors.description&&styles.inputErr]}>
        <TextAlignLeft size={18} color="#94A3B8" style={{marginTop:3}} />
        <TextInput style={[styles.textIn,{height:100,textAlignVertical:'top'}]} value={form.description} multiline numberOfLines={5}
          onChangeText={v=>{upd('description',v);setErrors(p=>({...p,description:undefined}));}}
          placeholder="Describe what's included, what to expect, requirements…" placeholderTextColor="#A1A1AA" />
      </View>
      {errors.description && <Text style={styles.err}>{errors.description}</Text>}
      <Text style={[styles.fieldLabel,{marginTop:14}]}>Service Images *</Text>
      <View style={styles.imgGrid}>
        {form.images.map((_,i) => (
          <View key={i} style={[styles.imgSlot,{borderColor:colors.gold,borderWidth:2}]}>
            <View style={[styles.imgFill,{backgroundColor:colors.goldLight}]}>
              <CheckCircle size={20} color={colors.gold} weight="fill" />
              <Text style={{fontSize:10,color:'#7A4F00',fontWeight:'700',marginTop:3}}>IMG {i+1}</Text>
            </View>
            <TouchableOpacity style={styles.removeImgBtn} onPress={()=>upd('images',form.images.filter((_,idx)=>idx!==i))}>
              <Trash size={11} color="#fff" weight="bold" />
            </TouchableOpacity>
          </View>
        ))}
        {form.images.length < 5 && (
          <TouchableOpacity style={[styles.imgAdd,{borderColor:colors.border}]}
            onPress={()=>{upd('images',[...form.images,`svc_${form.images.length+1}`]);setErrors(p=>({...p,images:undefined}));}} activeOpacity={0.8}>
            <Plus size={22} color={colors.navy} />
            <Text style={{fontSize:11,fontWeight:'600',color:colors.navy,marginTop:4}}>{form.images.length}/5</Text>
          </TouchableOpacity>
        )}
      </View>
      {errors.images && <Text style={styles.err}>{errors.images}</Text>}
    </View>
  );

  const step1 = () => (
    <View>
      <Text style={styles.stepTitle}>Pricing & Add-ons</Text>
      <Text style={styles.stepSub}>Choose how you charge and what extras customers can add to their booking.</Text>
      <Text style={styles.fieldLabel}>Price Type</Text>
      {PRICE_TYPES.map(pt => {
        const active = form.priceType === pt.key;
        return (
          <TouchableOpacity key={pt.key} style={[styles.priceCard, active&&{borderColor:colors.gold,backgroundColor:colors.goldLight}]}
            onPress={()=>upd('priceType',pt.key)} activeOpacity={0.85}>
            <View style={[styles.radio, active&&{borderColor:colors.gold}]}>
              {active && <View style={[styles.radioDot,{backgroundColor:colors.gold}]} />}
            </View>
            <View style={{flex:1}}>
              <Text style={{fontSize:15,fontWeight:'700',color:colors.navy,marginBottom:2}}>{pt.label}</Text>
              <Text style={{fontSize:12,color:colors.textSecondary}}>{pt.desc}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
      <Text style={[styles.fieldLabel,{marginTop:16}]}>{form.priceType==='per_hour'?'Hourly Rate (₦) *':form.priceType==='from'?'Starting from (₦) *':'Price (₦) *'}</Text>
      <View style={[styles.inputRow, errors.price&&styles.inputErr]}>
        <CurrencyNgn size={18} color="#94A3B8" />
        <TextInput style={styles.textIn} value={form.price} keyboardType="numeric" onChangeText={v=>{upd('price',v);setErrors(p=>({...p,price:undefined}));}} placeholder="e.g. 5000" placeholderTextColor="#A1A1AA" />
      </View>
      {errors.price && <Text style={styles.err}>{errors.price}</Text>}
      <Text style={[styles.fieldLabel,{marginTop:16}]}>Duration (minutes)</Text>
      <View style={{flexDirection:'row',alignItems:'center',gap:14,marginBottom:4}}>
        <TouchableOpacity style={[styles.qtyBtn,{borderColor:colors.border}]} onPress={()=>upd('duration',String(Math.max(15,parseInt(form.duration)-15)))}><Minus size={16} color={colors.navy} /></TouchableOpacity>
        <Text style={{fontSize:18,fontWeight:'700',color:colors.navy,minWidth:70,textAlign:'center'}}>{form.duration} min</Text>
        <TouchableOpacity style={[styles.qtyBtn,{borderColor:colors.border}]} onPress={()=>upd('duration',String(parseInt(form.duration)+15))}><Plus size={16} color={colors.navy} /></TouchableOpacity>
      </View>
      <Text style={[styles.fieldLabel,{marginTop:20}]}>Add-ons (Optional)</Text>
      {form.addons.map((a,i) => (
        <View key={i} style={{flexDirection:'row',gap:8,marginBottom:10}}>
          <View style={[styles.inputRow,{flex:1,marginBottom:0}]}><TextInput style={styles.textIn} value={a.name} onChangeText={v=>{const n=[...form.addons];n[i]={...n[i],name:v};upd('addons',n);}} placeholder="e.g. Express service" placeholderTextColor="#A1A1AA" /></View>
          <View style={[styles.inputRow,{width:110,marginBottom:0}]}><CurrencyNgn size={14} color="#94A3B8" /><TextInput style={styles.textIn} value={a.price} keyboardType="numeric" onChangeText={v=>{const n=[...form.addons];n[i]={...n[i],price:v};upd('addons',n);}} placeholder="Price" placeholderTextColor="#A1A1AA" /></View>
          <TouchableOpacity style={styles.iconBtn} onPress={()=>upd('addons',form.addons.filter((_,idx)=>idx!==i))}><Trash size={16} color="#DC2626" /></TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={[styles.addRow,{borderColor:colors.border}]} onPress={()=>upd('addons',[...form.addons,{name:'',price:''}])} activeOpacity={0.8}>
        <Plus size={16} color={colors.navy} /><Text style={[styles.addRowTxt,{color:colors.navy}]}>Add Add-on</Text>
      </TouchableOpacity>
    </View>
  );

  const step2 = () => (
    <View>
      <Text style={styles.stepTitle}>Service Location</Text>
      <Text style={styles.stepSub}>Where do you perform this service?</Text>
      {[
        {key:'instore', Icon:Wrench,  title:'In-Store / At My Location',    desc:'Customer comes to your premises.'},
        {key:'customer',Icon:MapPin,  title:"At Customer's Location",       desc:"You travel to the customer's address."},
        {key:'both',    Icon:Tag,     title:'Both Options Available',        desc:'Customer chooses at booking time.'},
      ].map(opt => {
        const active = form.locationType === opt.key;
        return (
          <TouchableOpacity key={opt.key} style={[styles.locCard, active&&{borderColor:colors.gold,backgroundColor:colors.navy}]}
            onPress={()=>{upd('locationType',opt.key);setErrors(p=>({...p,locationType:undefined}));}} activeOpacity={0.85}>
            <View style={[styles.locIcon, active&&{backgroundColor:colors.gold}]}><opt.Icon size={24} color={active?colors.navy:colors.navy} weight="fill" /></View>
            <View style={{flex:1}}>
              <Text style={[styles.locTitle, active&&{color:'#fff'}]}>{opt.title}</Text>
              <Text style={[styles.locDesc, active&&{color:'rgba(255,255,255,0.7)'}]}>{opt.desc}</Text>
            </View>
            {active && <Check size={20} color={colors.gold} weight="bold" />}
          </TouchableOpacity>
        );
      })}
      {errors.locationType && <Text style={styles.err}>{errors.locationType}</Text>}
    </View>
  );

  const step3 = () => (
    <View>
      <Text style={styles.stepTitle}>Availability</Text>
      <Text style={styles.stepSub}>Set your weekly working hours. Customers can only book within these times.</Text>
      {DAYS.map(day => {
        const d = form.schedule[day];
        return (
          <View key={day} style={[styles.dayRow,{borderColor:colors.border}]}>
            <Switch value={d.enabled} onValueChange={v=>setDay(day,'enabled',v)} trackColor={{true:colors.navy,false:'#E2E8F0'}} thumbColor="#fff" />
            <Text style={[styles.dayLabel,{color:d.enabled?colors.navy:'#94A3B8'}]}>{day}</Text>
            {d.enabled ? (
              <View style={{flexDirection:'row',alignItems:'center',gap:8,flex:1,justifyContent:'flex-end'}}>
                <View style={[styles.timeInput,{borderColor:colors.border}]}>
                  <TextInput style={[styles.textIn,{textAlign:'center',height:36}]} value={d.open} onChangeText={v=>setDay(day,'open',v)} placeholder="09:00" placeholderTextColor="#A1A1AA" />
                </View>
                <Text style={{color:colors.textSecondary,fontSize:14,fontWeight:'500'}}>—</Text>
                <View style={[styles.timeInput,{borderColor:colors.border}]}>
                  <TextInput style={[styles.textIn,{textAlign:'center',height:36}]} value={d.close} onChangeText={v=>setDay(day,'close',v)} placeholder="18:00" placeholderTextColor="#A1A1AA" />
                </View>
              </View>
            ) : <Text style={{flex:1,textAlign:'right',color:'#94A3B8',fontSize:13}}>Closed</Text>}
          </View>
        );
      })}
      <Text style={[styles.fieldLabel,{marginTop:20}]}>Max Concurrent Bookings</Text>
      <View style={{flexDirection:'row',alignItems:'center',gap:14,marginBottom:4}}>
        <TouchableOpacity style={[styles.qtyBtn,{borderColor:colors.border}]} onPress={()=>upd('concurrentLimit',String(Math.max(1,parseInt(form.concurrentLimit)-1)))}><Minus size={16} color={colors.navy} /></TouchableOpacity>
        <Text style={{fontSize:20,fontWeight:'700',color:colors.navy,minWidth:40,textAlign:'center'}}>{form.concurrentLimit}</Text>
        <TouchableOpacity style={[styles.qtyBtn,{borderColor:colors.border}]} onPress={()=>upd('concurrentLimit',String(parseInt(form.concurrentLimit)+1))}><Plus size={16} color={colors.navy} /></TouchableOpacity>
        <Text style={{fontSize:13,color:colors.textSecondary}}>{parseInt(form.concurrentLimit)===1?'customer at a time':'customers simultaneously'}</Text>
      </View>
      <View style={[styles.notifNote,{backgroundColor:colors.goldLight,borderColor:colors.gold,marginTop:20}]}>
        <Calendar size={16} color={colors.gold} />
        <Text style={{flex:1,fontSize:13,color:'#7A4F00',fontWeight:'500'}}>Block out specific dates (holidays, leave) from your dashboard after going live.</Text>
      </View>
    </View>
  );

  const step4 = () => {
    const cat = SERVICE_CATEGORIES.find(c=>c.id===form.category);
    const openDays = DAYS.filter(d=>form.schedule[d].enabled);
    const priceLabel = {fixed:'Fixed',from:'From',per_hour:'/hr'}[form.priceType];
    if (submitted) return (
      <View style={{alignItems:'center',paddingVertical:40}}>
        <View style={[styles.successBox,{backgroundColor:colors.goldLight,borderColor:colors.gold}]}><CheckCircle size={48} color={colors.gold} weight="fill" /></View>
        <Text style={[styles.stepTitle,{textAlign:'center',marginTop:20}]}>Service Listed!</Text>
        <Text style={[styles.stepSub,{textAlign:'center'}]}>"{form.name}" is live and open for bookings.</Text>
        <TouchableOpacity style={[styles.primaryBtn,{backgroundColor:colors.navy,marginTop:28}]} onPress={()=>navigation.goBack()} activeOpacity={0.88}>
          <Text style={[styles.primaryBtnTxt,{color:'#fff'}]}>Back to Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.primaryBtn,{backgroundColor:colors.goldLight,borderWidth:1.5,borderColor:colors.gold,marginTop:12}]}
          onPress={()=>{setForm(INIT);setStep(0);setSubmitted(false);}} activeOpacity={0.88}>
          <Text style={[styles.primaryBtnTxt,{color:colors.navy}]}>Add Another Service</Text>
        </TouchableOpacity>
      </View>
    );
    return (
      <View>
        <Text style={styles.stepTitle}>Review & Submit</Text>
        <Text style={styles.stepSub}>Confirm your service before going live.</Text>
        <View style={[styles.submitSummary,{borderColor:colors.border}]}>
          {[
            {l:'Service',   v:form.name},
            {l:'Category',  v:cat?.label||'—'},
            {l:'Price',     v:form.price?`₦${parseFloat(form.price).toLocaleString()} (${priceLabel})`:'—'},
            {l:'Duration',  v:`${form.duration} minutes`},
            {l:'Location',  v:{instore:'In-Store',customer:"At Customer's",both:'Both'}[form.locationType]||'—'},
            {l:'Open Days', v:openDays.join(', ')||'None'},
          ].map(r=>(
            <View key={r.l} style={[styles.reviewRow,{borderColor:colors.border}]}>
              <Text style={[styles.reviewLabel,{color:'#6B7280'}]}>{r.l}</Text>
              <Text style={[styles.reviewValue,{color:colors.textPrimary}]}>{r.v}</Text>
            </View>
          ))}
        </View>
        {saving && <View style={{alignItems:'center',marginTop:20}}><ActivityIndicator size="large" color={colors.gold} /><Text style={{fontSize:14,color:colors.textSecondary,marginTop:10}}>Publishing service…</Text></View>}
      </View>
    );
  };

  const STEPS = [step0,step1,step2,step3,step4];
  const progressPct = `${((step+1)/TOTAL_STEPS)*100}%`;

  return (
    <SafeAreaView style={[styles.root,{backgroundColor:colors.surface}]} edges={['top']}>
      <View style={[styles.header,{backgroundColor:colors.background,borderColor:colors.border}]}>
        <TouchableOpacity style={styles.headerBtn} onPress={goBack}><CaretLeft size={22} color={colors.navy} weight="bold" /></TouchableOpacity>
        <View style={{alignItems:'center'}}>
          <Text style={[styles.headerTitle,{color:colors.navy}]}>Add Service</Text>
          <Text style={[styles.headerSub,{color:colors.textSecondary}]}>Step {step+1} of {TOTAL_STEPS} · {STEP_TITLES[step]}</Text>
        </View>
        <View style={styles.headerBtn} />
      </View>
      <View style={[styles.progTrack,{backgroundColor:colors.border}]}>
        <View style={[styles.progFill,{width:progressPct,backgroundColor:colors.gold}]} />
      </View>
      <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {STEPS[step]?.()}
        <View style={{height:120}} />
      </ScrollView>
      {!submitted && (
        <View style={[styles.bottomBar,{backgroundColor:colors.background,borderColor:colors.border}]}>
          {step>0
            ? <TouchableOpacity style={[styles.backBtn,{borderColor:colors.border}]} onPress={goBack}><CaretLeft size={18} color={colors.navy} /><Text style={[styles.backBtnTxt,{color:colors.navy}]}>Back</Text></TouchableOpacity>
            : <View style={{flex:1}} />}
          <TouchableOpacity style={[styles.nextBtn,{backgroundColor:colors.navy},saving&&{opacity:0.65}]} onPress={goNext} disabled={saving} activeOpacity={0.88}>
            {saving ? <ActivityIndicator size="small" color="#fff" />
              : <><Text style={styles.nextBtnTxt}>{step===4?'Publish Service':'Continue'}</Text>{step<4&&<CaretRight size={18} color="#fff" weight="bold" />}</>}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  root:        {flex:1},
  header:      {flexDirection:'row',alignItems:'center',justifyContent:'space-between',height:58,paddingHorizontal:16,borderBottomWidth:1},
  headerBtn:   {width:44,height:44,justifyContent:'center'},
  headerTitle: {fontSize:16,fontWeight:'700'},
  headerSub:   {fontSize:11,fontWeight:'500',marginTop:1},
  progTrack:   {height:3},
  progFill:    {height:3,borderRadius:2},
  scroll:      {flex:1},
  scrollContent:{padding:20},
  stepTitle:   {fontSize:22,fontWeight:'800',color:colors.navy,marginBottom:8,letterSpacing:-0.3},
  stepSub:     {fontSize:14,color:colors.textSecondary,lineHeight:21,marginBottom:22},
  fieldLabel:  {fontSize:13,fontWeight:'600',marginBottom:7,textTransform:'uppercase',letterSpacing:0.4,color:colors.navy},
  err:         {fontSize:12,color:'#DC2626',fontWeight:'600',marginBottom:6,marginTop:2},
  catGrid:     {flexDirection:'row',flexWrap:'wrap',gap:10,marginBottom:4},
  catChip:     {flexDirection:'row',alignItems:'center',gap:6,borderWidth:1.2,borderColor:colors.border,borderRadius:999,paddingHorizontal:13,paddingVertical:9,backgroundColor:'#fff'},
  catEmoji:    {fontSize:15},
  catTxt:      {fontSize:13,fontWeight:'600',color:colors.navy},
  inputRow:    {flexDirection:'row',alignItems:'center',gap:10,borderWidth:1.2,borderColor:colors.border,borderRadius:12,paddingHorizontal:14,height:50,backgroundColor:'#fff',marginBottom:4},
  textareaRow: {alignItems:'flex-start',paddingTop:12,height:'auto'},
  textIn:      {flex:1,fontSize:15,color:colors.textPrimary},
  inputErr:    {borderColor:'#DC2626'},
  iconBtn:     {width:50,height:50,borderRadius:12,justifyContent:'center',alignItems:'center',backgroundColor:'#FEF2F2'},
  addRow:      {flexDirection:'row',alignItems:'center',gap:8,borderWidth:1.5,borderStyle:'dashed',borderRadius:12,padding:14,marginTop:4},
  addRowTxt:   {fontSize:14,fontWeight:'700'},
  imgGrid:     {flexDirection:'row',flexWrap:'wrap',gap:12,marginBottom:8},
  imgSlot:     {width:90,height:90,borderRadius:12,borderWidth:1.5,borderColor:colors.border,overflow:'hidden',position:'relative'},
  imgFill:     {position:'absolute',top:0,left:0,right:0,bottom:0,justifyContent:'center',alignItems:'center'},
  removeImgBtn:{position:'absolute',top:4,right:4,width:20,height:20,borderRadius:10,backgroundColor:'#DC2626',justifyContent:'center',alignItems:'center'},
  imgAdd:      {width:90,height:90,borderRadius:12,borderWidth:1.5,borderStyle:'dashed',justifyContent:'center',alignItems:'center'},
  priceCard:   {flexDirection:'row',alignItems:'center',gap:12,borderWidth:1.5,borderColor:colors.border,borderRadius:14,padding:14,marginBottom:10,backgroundColor:'#fff'},
  radio:       {width:20,height:20,borderRadius:10,borderWidth:2,borderColor:colors.border,justifyContent:'center',alignItems:'center'},
  radioDot:    {width:10,height:10,borderRadius:5},
  qtyBtn:      {width:42,height:42,borderRadius:12,borderWidth:1.5,justifyContent:'center',alignItems:'center'},
  locCard:     {flexDirection:'row',alignItems:'center',gap:14,borderWidth:1.5,borderColor:colors.border,borderRadius:14,padding:16,marginBottom:12,backgroundColor:'#fff'},
  locIcon:     {width:46,height:46,borderRadius:12,backgroundColor:colors.goldLight,justifyContent:'center',alignItems:'center',flexShrink:0},
  locTitle:    {fontSize:15,fontWeight:'700',color:colors.navy,marginBottom:2},
  locDesc:     {fontSize:13,color:colors.textSecondary},
  dayRow:      {flexDirection:'row',alignItems:'center',gap:12,borderWidth:1,borderRadius:12,padding:12,marginBottom:8,backgroundColor:'#fff'},
  dayLabel:    {fontSize:14,fontWeight:'700',width:36},
  timeInput:   {borderWidth:1.2,borderRadius:8,paddingHorizontal:10,width:76,justifyContent:'center'},
  notifNote:   {flexDirection:'row',alignItems:'flex-start',gap:10,borderWidth:1,borderRadius:10,padding:12},
  submitSummary:{borderWidth:1,borderRadius:14,overflow:'hidden',marginBottom:14,backgroundColor:'#fff'},
  reviewRow:   {flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12,paddingVertical:13,paddingHorizontal:16,borderBottomWidth:1},
  reviewLabel: {fontSize:13,fontWeight:'600'},
  reviewValue: {fontSize:14,fontWeight:'600',textAlign:'right',flex:1},
  successBox:  {width:90,height:90,borderRadius:45,borderWidth:2,justifyContent:'center',alignItems:'center'},
  primaryBtn:  {width:'100%',borderRadius:14,paddingVertical:15,alignItems:'center'},
  primaryBtnTxt:{fontSize:16,fontWeight:'800'},
  bottomBar:   {position:'absolute',bottom:0,left:0,right:0,flexDirection:'row',alignItems:'center',gap:12,paddingHorizontal:16,paddingTop:14,paddingBottom:28,borderTopWidth:1},
  backBtn:     {flexDirection:'row',alignItems:'center',gap:4,borderWidth:1.5,borderRadius:12,paddingHorizontal:18,paddingVertical:14},
  backBtnTxt:  {fontSize:15,fontWeight:'700'},
  nextBtn:     {flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6,borderRadius:14,paddingVertical:15},
  nextBtnTxt:  {fontSize:16,fontWeight:'800',color:'#fff'},
});
